import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Download, 
  ArrowUpRight, 
  MessageSquare, 
  Sparkles, 
  Smile, 
  Tag, 
  Clock, 
  Layers,
  ChevronRight,
  X,
  FileText,
  Lightbulb,
  ListChecks,
  Check,
  BrainCircuit
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { User } from 'firebase/auth';
import { 
  db, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  getGuestEntries,
  saveGuestEntries
} from '../lib/firebase';
import { JournalEntry, EntryCategory } from '../types';

interface EntryHistoryProps {
  user: any;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  user,
  onSelectEntry,
  onNewEntry
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Real-time Firestore subscription or Guest Sandbox buffer
  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    if (user.uid.startsWith('guest_')) {
      setEntries(getGuestEntries());
      setLoading(false);
      const handleGuestUpdate = () => {
        setEntries(getGuestEntries());
      };
      window.addEventListener('gemini_reflection_guest_entries_changed', handleGuestUpdate);
      return () => {
        window.removeEventListener('gemini_reflection_guest_entries_changed', handleGuestUpdate);
      };
    }

    setLoading(true);
    const userEntriesRef = collection(db, 'users', user.uid, 'entries');
    const q = query(userEntriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEntries: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedEntries.push({
            id: docSnap.id,
            userId: user.uid,
            title: data.title || 'Untitled Reflection',
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
        setEntries(fetchedEntries);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore entries subscription error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteEntry = async (entryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user?.uid) return;
    try {
      if (user.uid.startsWith('guest_')) {
        const currentList = getGuestEntries().filter(item => item.id !== entryId);
        saveGuestEntries(currentList);
        if (selectedDetailEntry?.id === entryId) {
          setSelectedDetailEntry(null);
        }
        setDeleteConfirmId(null);
        return;
      }
      await deleteDoc(doc(db, 'users', user.uid, 'entries', entryId));
      if (selectedDetailEntry?.id === entryId) {
        setSelectedDetailEntry(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleToggleFavorite = async (entry: JournalEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user?.uid) return;
    try {
      const nextVal = !entry.isFavorite;
      if (user.uid.startsWith('guest_')) {
        const currentList = getGuestEntries().map(item => item.id === entry.id ? { ...item, isFavorite: nextVal } : item);
        saveGuestEntries(currentList);
        return;
      }
      await updateDoc(doc(db, 'users', user.uid, 'entries', entry.id), {
        isFavorite: nextVal
      });
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const handleExportMarkdown = (entry: JournalEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const content = `# ${entry.title}\n\n` +
      `**Category:** ${entry.category} | **Date:** ${new Date(entry.createdAt).toLocaleDateString()} | **Sentiment:** ${entry.sentiment}\n` +
      `**Tags:** ${entry.tags.join(', ')}\n\n` +
      `## Executive Summary\n${entry.summary || 'N/A'}\n\n` +
      `## Key Insights\n${entry.keyInsights.map(i => `- ${i}`).join('\n') || 'None'}\n\n` +
      `## Action Items\n${entry.actionItems.map(a => `- [ ] ${a}`).join('\n') || 'None'}\n\n` +
      `## Dialogue History\n\n` +
      entry.messages.map(m => `### ${m.role === 'user' ? 'You' : 'Gemini 3.6 Flash'}\n${m.content}\n`).join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesFavorite = !onlyFavorites || entry.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Controls & Filter Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Past Journal Entries & Reflections</span>
              <span className="text-xs font-mono font-normal bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Securely stored in your isolated Firestore collection (<code className="font-mono text-slate-700">/users/{user.uid.slice(0, 8)}.../entries</code>).
            </p>
          </div>

          <button
            onClick={onNewEntry}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Start New Reflection</span>
          </button>
        </div>

        {/* Search Bar & Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, tags, reflections, or insights..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Categories</option>
              <option value="reflection">Deep Reflection</option>
              <option value="journal">Daily Journal</option>
              <option value="brainstorm">Creative Brainstorm</option>
              <option value="gratitude">Gratitude Log</option>
              <option value="goal">Goal & Strategy</option>
              <option value="mindfulness">Mindful Check-in</option>
            </select>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                onlyFavorites 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Show only bookmarked favorites"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-12 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Journal Entries Found</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || onlyFavorites
              ? 'Try clearing your filters or search keywords to view all reflections.'
              : 'You haven’t recorded any journal entries yet. Start your first reflection with Gemini 3.6 Flash.'}
          </p>
          <button
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors mt-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Write First Entry</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedDetailEntry(entry)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group relative"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                    {entry.category}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {entry.sentiment && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {entry.sentiment}
                      </span>
                    )}

                    <button
                      onClick={(e) => handleToggleFavorite(entry, e)}
                      className={`p-1 rounded transition-colors ${
                        entry.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      {entry.isFavorite ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                  {entry.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {entry.summary || (entry.messages[0]?.content.slice(0, 140) + '...')}
                </p>

                {/* Tags Preview */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{entry.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {entry.messages.length}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntry(entry);
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-colors"
                    title="Open in Reflection Studio"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(entry.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === entry.id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 bg-white/95 rounded-xl p-4 flex flex-col justify-center items-center text-center z-10 space-y-3"
                >
                  <p className="text-xs font-bold text-rose-700">Permanently delete this entry?</p>
                  <p className="text-[11px] text-slate-500">This action removes it from your Firestore database.</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                      className="px-2.5 py-1 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-md font-medium"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Selected Entry Detail Modal / Drawer */}
      {selectedDetailEntry && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 capitalize">
                    {selectedDetailEntry.category}
                  </span>
                  {selectedDetailEntry.sentiment && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {selectedDetailEntry.sentiment}
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-500">
                    {new Date(selectedDetailEntry.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedDetailEntry.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportMarkdown(selectedDetailEntry)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Export Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    onSelectEntry(selectedDetailEntry);
                    setSelectedDetailEntry(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Continue in Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedDetailEntry(null)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Executive Summary */}
              {selectedDetailEntry.summary && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-emerald-700" />
                    AI Executive Summary
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {selectedDetailEntry.summary}
                  </p>
                </div>
              )}

              {/* Key Takeaways & Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDetailEntry.keyInsights.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Key Insights
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {selectedDetailEntry.keyInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDetailEntry.actionItems.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-blue-600" />
                      Actionable Next Steps
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {selectedDetailEntry.actionItems.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Complete Multi-Turn Conversation */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Conversation Dialogue ({selectedDetailEntry.messages.length} turns)
                </h3>

                <div className="space-y-4">
                  {selectedDetailEntry.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-slate-900 text-slate-50 border-slate-900 ml-8'
                          : 'bg-slate-50 text-slate-900 border-slate-200 mr-8'
                      }`}
                    >
                      <div className="text-[10px] font-semibold mb-1 opacity-75">
                        {m.role === 'user' ? 'You' : 'Gemini 3.6 Flash'}
                      </div>
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div className="markdown-body prose prose-slate prose-sm max-w-none">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
