import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Code2,
  RefreshCw
} from 'lucide-react';
import { ThreatModelResult, ThreatZone, ThreatItem } from '../types';
import { ARCHITECTURE_TEMPLATES, ArchitectureTemplate } from '../data/threatScenarios';

export const ThreatModelingStudio: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ArchitectureTemplate>(ARCHITECTURE_TEMPLATES[0]);
  const [customArchitectureName, setCustomArchitectureName] = useState(ARCHITECTURE_TEMPLATES[0].name);
  const [customDescription, setCustomDescription] = useState(ARCHITECTURE_TEMPLATES[0].description);
  const [activeZoneFilter, setActiveZoneFilter] = useState<ThreatZone | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [threatModelResult, setThreatModelResult] = useState<ThreatModelResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>('TZ1-01');

  const handleSelectTemplate = (tpl: ArchitectureTemplate) => {
    setSelectedTemplate(tpl);
    setCustomArchitectureName(tpl.name);
    setCustomDescription(tpl.description);
  };

  const handleGenerateThreatModel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/threat-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architectureName: customArchitectureName,
          description: customDescription,
          components: selectedTemplate.components,
          inputSurfaces: selectedTemplate.inputSurfaces,
          tools: selectedTemplate.toolsUsed,
          storageType: selectedTemplate.storageType,
          integrations: selectedTemplate.integrations
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Failed to generate threat model`);
      }

      const data: ThreatModelResult = await response.json();
      setThreatModelResult(data);
      if (data.threatZones?.[0]?.items?.[0]) {
        setExpandedThreatId(data.threatZones[0].items[0].id);
      }
    } catch (err) {
      console.error('Threat model error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const threatZonesMeta: { zone: ThreatZone; name: string; icon: string; description: string }[] = [
    { zone: 'input_surfaces', name: 'Zone 1: Input Surfaces', icon: '📥', description: 'Prompts, user uploads, external API payloads' },
    { zone: 'planning_reasoning', name: 'Zone 2: Planning & Reasoning', icon: '🧠', description: 'Prompt injection, jailbreaks, tool routing hijacking' },
    { zone: 'tool_execution', name: 'Zone 3: Tool Execution', icon: '⚙️', description: 'Privilege escalation, SSRF, dynamic code execution' },
    { zone: 'memory_state', name: 'Zone 4: Memory & State', icon: '💾', description: 'Firestore state, session hijacking, cross-user leaks' },
    { zone: 'inter_system_communication', name: 'Zone 5: Inter-System Comms', icon: '🔗', description: 'Secret Manager, API tokens, egress leakage' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directive 1: Agentic Threat Modeling</span>
              <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">
                The 5 Threat Zones
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Scenario-Driven Agentic Threat Analyzer</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Execute structured threat assessments mapping architecture entry points to OWASP Top 10 (Web & LLM) with concrete code countermeasures.
            </p>
          </div>
          <button
            id="btn-run-threat-model"
            onClick={handleGenerateThreatModel}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Analyzing Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Generate 5-Zone Threat Model</span>
              </>
            )}
          </button>
        </div>

        {/* 5 Threat Zones Grid Pill Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-slate-100">
          {threatZonesMeta.map((tz) => (
            <div 
              key={tz.zone}
              onClick={() => setActiveZoneFilter(activeZoneFilter === tz.zone ? 'ALL' : tz.zone)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                activeZoneFilter === tz.zone 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{tz.icon}</span>
                <span className={`text-xs font-semibold ${activeZoneFilter === tz.zone ? 'text-white' : 'text-slate-900'}`}>
                  {tz.name}
                </span>
              </div>
              <p className={`text-[11px] mt-1 line-clamp-2 ${activeZoneFilter === tz.zone ? 'text-slate-300' : 'text-slate-500'}`}>
                {tz.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration & Preset Architecture Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Target Architecture Profiles</span>
          </h3>

          <div className="space-y-2">
            {ARCHITECTURE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                id={`btn-template-${tpl.id}`}
                onClick={() => handleSelectTemplate(tpl)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTemplate.id === tpl.id
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{tpl.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Architecture Name</label>
              <input
                type="text"
                id="input-arch-name"
                value={customArchitectureName}
                onChange={(e) => setCustomArchitectureName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">System Scope Description</label>
              <textarea
                rows={3}
                id="input-arch-desc"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Selected Architecture Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500" />
              <span>Architecture Components & Data Flow</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Storage: {selectedTemplate.storageType}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-700 block mb-1.5">Active Components:</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {selectedTemplate.components.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-700 block mb-1.5">Input Surfaces & Triggers:</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {selectedTemplate.inputSurfaces.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">Untrusted Input / Payload Sample:</span>
              <span className="text-[10px] text-amber-700 font-medium">Injection Test Vector</span>
            </div>
            <pre className="p-2.5 bg-slate-900 text-slate-100 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
              {selectedTemplate.samplePayload}
            </pre>
          </div>
        </div>
      </div>

      {/* Threat Modeling Results Section */}
      {threatModelResult ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{threatModelResult.systemName}</h3>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                  Model: {threatModelResult.generatedWithModel || 'gemini-3.6-flash'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">{threatModelResult.executiveSummary}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Risk Exposure</span>
                <span className="text-2xl font-black text-rose-600">{threatModelResult.threatScore}/100</span>
              </div>
            </div>
          </div>

          {/* Mandatory Execution Criteria: Threat Summary Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Threat Summary Table (5 Threat Zones Mapping)</span>
              </h4>
              <span className="text-xs text-slate-500">
                Filtered: <span className="font-semibold text-slate-900">{activeZoneFilter}</span>
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-3.5 py-2.5 text-left">Zone & ID</th>
                    <th className="px-3.5 py-2.5 text-left">Threat Title & Scenario</th>
                    <th className="px-3.5 py-2.5 text-left">OWASP LLM / Web</th>
                    <th className="px-3.5 py-2.5 text-left">STRIDE</th>
                    <th className="px-3.5 py-2.5 text-left">Severity</th>
                    <th className="px-3.5 py-2.5 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {threatModelResult.threatZones
                    .filter(tz => activeZoneFilter === 'ALL' || tz.zone === activeZoneFilter)
                    .flatMap(tz => tz.items)
                    .map((item) => (
                      <tr 
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors ${expandedThreatId === item.id ? 'bg-slate-50' : ''}`}
                      >
                        <td className="px-3.5 py-2.5 font-mono text-slate-900 font-medium whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.scenario}</div>
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <div className="text-slate-900 font-medium">{item.owaspLLM}</div>
                          <div className="text-slate-500 text-[11px]">{item.owaspWeb}</div>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                          {item.strideCategory}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(item.severity)}`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedThreatId(expandedThreatId === item.id ? null : item.id)}
                            className="text-xs text-slate-900 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{expandedThreatId === item.id ? 'Hide Details' : 'View Fix'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deep Threat Remediation & Code Countermeasure Inspector */}
          {expandedThreatId && (
            (() => {
              const selectedItem = threatModelResult.threatZones
                .flatMap(tz => tz.items)
                .find(i => i.id === expandedThreatId);
              
              if (!selectedItem) return null;

              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-slate-500 font-semibold">{selectedItem.id} Details</span>
                      <h4 className="text-base font-bold text-slate-900">{selectedItem.title}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getSeverityBadgeClass(selectedItem.severity)}`}>
                      {selectedItem.severity} Severity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Attack Vector:</span>
                      <p className="text-slate-600">{selectedItem.attackVector}</p>

                      <span className="font-semibold text-slate-800 block mt-3 mb-1">Mandatory Countermeasures:</span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        {selectedItem.countermeasures.map((cm, idx) => (
                          <li key={idx}>{cm}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Test Verification Steps:</span>
                      <ol className="space-y-1 text-slate-600 list-decimal list-inside">
                        {selectedItem.testVerificationSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Code Remediation Snippet */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">Concrete Code Remediation Snippet</span>
                      <button
                        onClick={() => copySnippet(selectedItem.id, selectedItem.codeRemediationSnippet)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        {copiedId === selectedItem.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {selectedItem.codeRemediationSnippet}
                    </pre>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700">No threat model generated yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Select an architecture template and click &quot;Generate 5-Zone Threat Model&quot; to perform deep scenario-driven threat analysis and produce the Threat Summary Table.
          </p>
        </div>
      )}
    </div>
  );
};
