import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Smile, 
  Sparkles, 
  Tag, 
  Lightbulb, 
  ListChecks, 
  Calendar, 
  BrainCircuit, 
  CheckCircle2,
  PieChart,
  Activity,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, collection, query, orderBy, onSnapshot } from '../lib/firebase';
import { JournalEntry } from '../types';

interface InsightsDashboardProps {
  user: User;
  onNavigateToStudio?: () => void;
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  user,
  onNavigateToStudio
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'users', user.uid, 'entries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: JournalEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          userId: user.uid,
          title: data.title || 'Untitled',
          category: data.category || 'reflection',
          tags: data.tags || [],
          summary: data.summary || '',
          sentiment: data.sentiment || 'Reflective',
          keyInsights: data.keyInsights || [],
          actionItems: data.actionItems || [],
          messages: data.messages || [],
          isFavorite: Boolean(data.isFavorite),
          wordCount: data.wordCount || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : (data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : (data.updatedAt || Date.now())
        });
      });
      setEntries(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Aggregate metrics
  const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
  const totalInsights = entries.reduce((sum, e) => sum + e.keyInsights.length, 0);
  const totalActions = entries.reduce((sum, e) => sum + e.actionItems.length, 0);

  // Sentiment counts
  const sentimentCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const s = e.sentiment || 'Reflective';
    sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
  });

  // Category counts
  const categoryCounts: Record<string, number> = {};
  entries.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  entries.forEach((e) => {
    e.tags.forEach((t) => {
      const cleanTag = t.replace('#', '').trim();
      if (cleanTag) {
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      }
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Recent key insights
  const recentInsights = entries
    .flatMap(e => e.keyInsights.map(k => ({ insight: k, title: e.title, date: e.createdAt })))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Reflections</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{entries.length}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Logged in Firestore</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">AI Insights</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalInsights}</div>
            <span className="text-[10px] text-blue-700 font-medium">Gemini Synthesized</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Action Items</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalActions}</div>
            <span className="text-[10px] text-purple-700 font-medium">Next steps extracted</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Words Written</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalWords.toLocaleString()}</div>
            <span className="text-[10px] text-amber-700 font-medium">Stream of thoughts</span>
          </div>
        </div>

      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sentiment & Tone Distribution */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-600" />
              <span>Emotional & Cognitive Tones</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Gemini 3.6 Analysis</span>
          </div>

          {Object.keys(sentimentCounts).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No sentiment data yet. Complete reflections to generate emotional tone analytics.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(sentimentCounts).map(([sent, count]) => {
                const percentage = Math.round((count / entries.length) * 100);
                return (
                  <div key={sent} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sent}</span>
                      <span className="font-mono text-slate-500">{count} {count === 1 ? 'entry' : 'entries'} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Reflection Modalities</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Activity Distribution</span>
          </div>

          {Object.keys(categoryCounts).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No categories logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-700 capitalize block">{cat}</span>
                  <div className="text-lg font-bold text-slate-900">{count}</div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round((count / entries.length) * 100)}% of total
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Extracted Themes & Tags */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Most Frequent Cognitive Themes & Recurring Topics</span>
            </h3>
            <span className="text-xs text-slate-500">Auto-extracted by Gemini</span>
          </div>

          {sortedTags.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No recurring tags detected yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {sortedTags.map(([tag, count], idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200/70 text-xs font-medium"
                >
                  <span>#{tag}</span>
                  <span className="bg-purple-200/60 text-purple-900 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent High-Impact Insights */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recent Synthesized Insights Across All Sessions</span>
            </h3>
            <button
              onClick={onNavigateToStudio}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Reflect on these insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentInsights.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No insights gathered yet. Start a reflection in the studio.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {recentInsights.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/30 rounded-xl border border-amber-200/60 space-y-2">
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    "{item.insight}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-amber-200/40">
                    <span className="font-semibold text-slate-700 line-clamp-1">{item.title}</span>
                    <span className="font-mono">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
