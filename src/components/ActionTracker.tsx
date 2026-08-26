import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Calendar, 
  Sparkles, 
  ListChecks, 
  Tag, 
  Filter, 
  Plus, 
  Clock, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, doc, setDoc } from '../lib/firebase';
import { JournalEntry, ActionItem, ActionItemStatus } from '../types';

interface ActionTrackerProps {
  user: User;
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const ActionTracker: React.FC<ActionTrackerProps> = ({
  user,
  entries,
  onSelectEntry
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'done' | 'dropped'>('open');
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Aggregate all action items across all entries
  const allActionItems: { entry: JournalEntry; item: ActionItem }[] = [];
  localEntries.forEach((entry) => {
    if (entry.actionItemsStructured && entry.actionItemsStructured.length > 0) {
      entry.actionItemsStructured.forEach((item) => {
        allActionItems.push({ entry, item });
      });
    } else if (entry.actionItems && entry.actionItems.length > 0) {
      entry.actionItems.forEach((text, idx) => {
        allActionItems.push({
          entry,
          item: {
            id: `legacy_${entry.id}_${idx}`,
            text,
            status: 'open',
            priority: 'medium'
          }
        });
      });
    }
  });

  const filteredItems = allActionItems.filter(({ item }) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleUpdateStatus = async (targetEntry: JournalEntry, itemId: string, newStatus: ActionItemStatus) => {
    const updatedStructured: ActionItem[] = (targetEntry.actionItemsStructured || []).map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: newStatus,
          resolvedAt: newStatus !== 'open' ? new Date().toISOString() : undefined
        };
      }
      return item;
    });

    // If it was a legacy item without structured array, build it
    if (!targetEntry.actionItemsStructured || targetEntry.actionItemsStructured.length === 0) {
      targetEntry.actionItems.forEach((text, idx) => {
        const id = `legacy_${targetEntry.id}_${idx}`;
        updatedStructured.push({
          id,
          text,
          status: id === itemId ? newStatus : 'open',
          priority: 'medium',
          resolvedAt: id === itemId && newStatus !== 'open' ? new Date().toISOString() : undefined
        });
      });
    }

    // Optimistically update local state
    setLocalEntries(prev => prev.map(e => e.id === targetEntry.id ? { ...e, actionItemsStructured: updatedStructured } : e));

    try {
      const entryRef = doc(db, 'users', user.uid, 'entries', targetEntry.id);
      await setDoc(entryRef, { actionItemsStructured: updatedStructured }, { merge: true });
    } catch (err) {
      console.error('Failed to sync action item status to Firestore:', err);
    }
  };

  const totalCount = allActionItems.length;
  const doneCount = allActionItems.filter(i => i.item.status === 'done').length;
  const openCount = allActionItems.filter(i => i.item.status === 'open').length;
  const droppedCount = allActionItems.filter(i => i.item.status === 'dropped').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <ListChecks className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Action Item Tracker &amp; Follow-Through</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Loop Closure
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Close the loop on insights. Mark items done, keep them open, or intentionally drop them without guilt.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['open', 'done', 'dropped', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status} ({status === 'open' ? openCount : status === 'done' ? doneCount : status === 'dropped' ? droppedCount : totalCount})
              </button>
            ))}
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No action items found in category "{filterStatus}". Synthesize new commitments in Reflection Studio!
            </div>
          ) : (
            filteredItems.map(({ entry, item }) => (
              <div
                key={`${entry.id}_${item.id}`}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  item.status === 'done'
                    ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                    : item.status === 'dropped'
                    ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-slate-200 text-slate-800 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs leading-relaxed">{item.text}</span>
                    {item.priority && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : item.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Source: <strong>{entry.title}</strong></span>
                    <span>•</span>
                    <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* State Toggles: Open, Done, Dropped */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(entry, item.id, 'open')}
                    title="Mark as Open"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      item.status === 'open'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(entry, item.id, 'done')}
                    title="Mark as Completed"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      item.status === 'done'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Done</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(entry, item.id, 'dropped')}
                    title="Drop without guilt"
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      item.status === 'dropped'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Drop</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
