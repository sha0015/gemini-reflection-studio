/**
 * Client-Side WebCrypto AES-GCM & PBKDF2 Encryption Vault
 *
 * Journal content is encrypted in the browser under a random per-entry data key (DEK)
 * before it is ever written to Firestore. The DEK itself is independently wrapped under
 * two secrets derived via PBKDF2 -- the user's passphrase and their 12-word recovery
 * phrase -- so either secret alone can unlock an entry. Firestore only ever stores the
 * ciphertext and the two wrapped-key envelopes; plaintext never reaches the server.
 */

export interface KeyWrap {
  salt: string;   // Base64-encoded 16-byte PBKDF2 salt for this secret
  iv: string;      // Base64-encoded 12-byte AES-GCM IV used to wrap the data key
  wrappedKey: string; // Base64-encoded ciphertext of the raw 32-byte data key
}

export interface CipherEnvelope {
  v: number;              // Envelope format version (2 = dual key-wrap)
  iv: string;             // Base64-encoded 12-byte IV used to encrypt the content
  ct: string;              // Base64-encoded ciphertext of the content
  tagLength?: number;     // 128
  encryptedAt: string;
  keyWraps: {
    passphrase: KeyWrap;
    recovery: KeyWrap;
  };
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a CryptoKey from a secret (passphrase or recovery phrase) + salt using PBKDF2
export async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function aesGcmEncrypt(key: CryptoKey, iv: Uint8Array, bytes: Uint8Array): Promise<ArrayBuffer> {
  return window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, tagLength: 128 }, key, bytes as BufferSource);
}

async function aesGcmDecrypt(key: CryptoKey, iv: Uint8Array, bytes: Uint8Array): Promise<ArrayBuffer> {
  return window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource, tagLength: 128 }, key, bytes as BufferSource);
}

async function wrapDataKey(dek: Uint8Array, secret: string): Promise<KeyWrap> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const kek = await deriveKey(secret, salt);
  const wrapped = await aesGcmEncrypt(kek, iv, dek);
  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    wrappedKey: bufferToBase64(wrapped)
  };
}

async function unwrapDataKey(wrap: KeyWrap, secret: string): Promise<Uint8Array> {
  const salt = new Uint8Array(base64ToBuffer(wrap.salt));
  const iv = new Uint8Array(base64ToBuffer(wrap.iv));
  const kek = await deriveKey(secret, salt);
  const raw = await aesGcmDecrypt(kek, iv, new Uint8Array(base64ToBuffer(wrap.wrappedKey)));
  return new Uint8Array(raw);
}

/**
 * Encrypt arbitrary JSON-serializable data under a random data key, then wrap that
 * data key independently under the passphrase and the recovery phrase. Either secret
 * can later decrypt the content on its own via decryptClientSide.
 */
export async function encryptClientSide<T>(data: T, passphrase: string, recoveryPhrase: string): Promise<CipherEnvelope> {
  const dek = window.crypto.getRandomValues(new Uint8Array(32));
  const dekKey = await window.crypto.subtle.importKey('raw', dek as BufferSource, { name: 'AES-GCM' }, false, ['encrypt']);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(JSON.stringify(data));
  const cipherBuffer = await aesGcmEncrypt(dekKey, iv, plaintextBytes);

  const [passphraseWrap, recoveryWrap] = await Promise.all([
    wrapDataKey(dek, passphrase),
    wrapDataKey(dek, recoveryPhrase)
  ]);

  return {
    v: 2,
    iv: bufferToBase64(iv),
    ct: bufferToBase64(cipherBuffer),
    tagLength: 128,
    encryptedAt: new Date().toISOString(),
    keyWraps: {
      passphrase: passphraseWrap,
      recovery: recoveryWrap
    }
  };
}

/**
 * Decrypt a CipherEnvelope using either the passphrase or the recovery phrase --
 * whichever secret the caller has. Tries both key-wrap slots against the supplied
 * secret since the caller doesn't know in advance which one it is.
 */
export async function decryptClientSide<T>(envelope: CipherEnvelope, secret: string): Promise<T> {
  const iv = new Uint8Array(base64ToBuffer(envelope.iv));
  const cipherBytes = new Uint8Array(base64ToBuffer(envelope.ct));

  let dek: Uint8Array | null = null;
  for (const wrap of [envelope.keyWraps.passphrase, envelope.keyWraps.recovery]) {
    try {
      dek = await unwrapDataKey(wrap, secret);
      break;
    } catch {
      // Wrong slot for this secret -- try the other one.
    }
  }

  if (!dek) {
    throw new Error('Incorrect passphrase or recovery phrase.');
  }

  const dekKey = await window.crypto.subtle.importKey('raw', dek as BufferSource, { name: 'AES-GCM' }, false, ['decrypt']);
  const decryptedBuffer = await aesGcmDecrypt(dekKey, iv, cipherBytes);
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedBuffer)) as T;
}

// 12-word mnemonic recovery phrase generator
const MNEMONIC_WORDS = [
  'autumn', 'amber', 'beacon', 'breeze', 'cedar', 'canyon', 'dawn', 'drift',
  'echo', 'ember', 'forest', 'frost', 'glacier', 'grove', 'haven', 'horizon',
  'island', 'iris', 'journey', 'juniper', 'karma', 'lagoon', 'meadow', 'moss',
  'nebula', 'oasis', 'ocean', 'pine', 'path', 'quartz', 'river', 'ripple',
  'solace', 'summit', 'tide', 'timber', 'unity', 'valley', 'voyage', 'whisper',
  'willow', 'zenith', 'zephyr', 'zen', 'sage', 'stone', 'spark', 'shadow'
];

export function generateRecoveryPhrase(): string {
  const words: string[] = [];
  const randomArray = new Uint8Array(12);
  window.crypto.getRandomValues(randomArray);

  for (let i = 0; i < 12; i++) {
    const wordIndex = randomArray[i] % MNEMONIC_WORDS.length;
    words.push(MNEMONIC_WORDS[wordIndex]);
  }
  return words.join(' ');
}
