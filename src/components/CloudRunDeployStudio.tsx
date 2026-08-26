import React, { useState } from 'react';
import { 
  Cloud, 
  KeyRound, 
  Tag, 
  Terminal, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CloudRunDeployStudio: React.FC = () => {
  const [serviceName, setServiceName] = useState('sentinel-threatlens');
  const [region, setRegion] = useState('asia-southeast1');
  const [projectNumber, setProjectNumber] = useState('586821086323');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const secretManagerCommands = `# 1. Enable Google Cloud APIs
gcloud services enable run.googleapis.com secretmanager.googleapis.com firestore.googleapis.com

# 2. Create Secret Manager secret for GEMINI_API_KEY
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Secret Accessor role to Cloud Run runtime service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \\
  --member="serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"`;

  const deployCommand = `gcloud run deploy ${serviceName} \\
  --source . \\
  --platform managed \\
  --region ${region} \\
  --allow-unauthenticated \\
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \\
  --port 3000`;

  const campaignLabelCommand = `gcloud run services update ${serviceName} \\
  --update-labels=dev-tutorial=cloud-run-ai-challenge \\
  --region ${region}`;

  const fullReadmePreview = `# Sentinel ThreatLens - Production Deployment Guide

## 1. Secret Manager Binding
\`\`\`bash
${secretManagerCommands}
\`\`\`

## 2. Cloud Run Deployment
\`\`\`bash
${deployCommand}
\`\`\`

## 3. Mandatory Campaign Verification Label
\`\`\`bash
${campaignLabelCommand}
\`\`\`

## 4. Firestore Security Rules
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\``;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directive 7: Deployment & Campaign Verification</span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded border border-emerald-200">
                Cloud Run Ready
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Google Cloud Run & Secret Manager Deployment Hub</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Generate ready-to-execute gcloud commands for Secret Manager IAM bindings, Cloud Run service deployment, and mandatory campaign labeling.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard('all-readme', fullReadmePreview)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {copiedSection === 'all-readme' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>README Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Export Production README.md</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deployment Parameter Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Deployment Target Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cloud Run Service Name</label>
            <input
              type="text"
              id="input-service-name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">GCP Region</label>
            <input
              type="text"
              id="input-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Project Number (for IAM SA)</label>
            <input
              type="text"
              id="input-project-num"
              value={projectNumber}
              onChange={(e) => setProjectNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Step 1: Secret Manager Setup */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="text-sm font-semibold text-slate-900">Google Cloud Secret Manager & IAM Configuration</h3>
          </div>
          <button
            onClick={() => copyToClipboard('secret-cmd', secretManagerCommands)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            {copiedSection === 'secret-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'secret-cmd' ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Enforce zero-hardcoding hygiene by creating a Secret Manager secret and binding the Cloud Run runtime service account with <code className="font-mono text-slate-800">roles/secretmanager.secretAccessor</code>.
        </p>

        <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {secretManagerCommands}
        </pre>
      </div>

      {/* Step 2: Cloud Run Deploy */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="text-sm font-semibold text-slate-900">Container Deployment to Google Cloud Run</h3>
          </div>
          <button
            onClick={() => copyToClipboard('deploy-cmd', deployCommand)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            {copiedSection === 'deploy-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'deploy-cmd' ? 'Copied' : 'Copy Deploy Command'}</span>
          </button>
        </div>

        <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {deployCommand}
        </pre>
      </div>

      {/* Step 3: Mandatory Campaign Labeling */}
      <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">3</div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-emerald-950">Mandatory Challenge Campaign Labeling</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                Required for Verification
              </span>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard('label-cmd', campaignLabelCommand)}
            className="flex items-center gap-1 text-xs text-emerald-900 hover:text-emerald-950 font-medium cursor-pointer"
          >
            {copiedSection === 'label-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'label-cmd' ? 'Copied' : 'Copy Label Command'}</span>
          </button>
        </div>

        <p className="text-xs text-emerald-900">
          Applies the verification label <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">dev-tutorial=cloud-run-ai-challenge</code> to register the Cloud Run service for automated challenge verification.
        </p>

        <pre className="p-3.5 bg-slate-900 text-emerald-300 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {campaignLabelCommand}
        </pre>
      </div>
    </div>
  );
};
