/**
 * Client-Side WebCrypto AES-GCM & PBKDF2 Encryption Vault
 * 
 * Guarantees that raw journal entries, message threads, summaries, and AI reflection
 * replies are encrypted in the user's browser before ever touching Firestore or network storage.
 * 
 * Plaintext exists only in local memory and transiently during API calls to Gemini —
 * at rest in Firestore, it is strictly an opaque ciphertext envelope.
 */

export interface CipherEnvelope {
  v: number;              // Version (1)
  iv: string;             // Base64-encoded 12-byte initialization vector
  salt: string;           // Base64-encoded 16-byte PBKDF2 salt
  ct: string;             // Base64-encoded ciphertext
  tagLength?: number;     // 128
  encryptedAt: string;
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
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

// Derive a CryptoKey from passphrase + salt using PBKDF2
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary JSON serializable object or string with a user passphrase
 */
export async function encryptClientSide<T>(data: T, passphrase: string): Promise<CipherEnvelope> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(JSON.stringify(data));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    plaintextBytes
  );

  return {
    v: 1,
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    ct: bufferToBase64(cipherBuffer),
    tagLength: 128,
    encryptedAt: new Date().toISOString()
  };
}

/**
 * Decrypt a CipherEnvelope back into its original JSON data
 */
export async function decryptClientSide<T>(envelope: CipherEnvelope, passphrase: string): Promise<T> {
  const salt = new Uint8Array(base64ToBuffer(envelope.salt));
  const iv = new Uint8Array(base64ToBuffer(envelope.iv));
  const cipherBytes = base64ToBuffer(envelope.ct);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
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
