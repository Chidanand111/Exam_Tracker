"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Pin,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Lock,
  Clock,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

interface Note {
  id: string;
  recruitmentId: string;
  title: string | null;
  content: string;
  isPinned: boolean;
  checklist: ChecklistItem[] | null;
  createdAt: string;
  updatedAt: string;
}

interface RecruitmentNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruitmentId: string;
  recruitmentTitle: string;
}

const NOTE_TEMPLATES = [
  "Need to obtain OBC/EWS category certificate before cutoff date",
  "Check Tier 1 syllabus and previous year questions this weekend",
  "Application fee payment completed - verify bank statement",
  "Ask college registrar for provisional degree certificate and consolidated marksheet",
  "Update photograph and signature specifications as per notification guidelines",
];

export default function RecruitmentNotesModal({
  isOpen,
  onClose,
  recruitmentId,
  recruitmentTitle,
}: RecruitmentNotesModalProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newChecklist, setNewChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistInput, setNewChecklistInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recruitmentId) {
      fetchNotes();
    }
  }, [isOpen, recruitmentId]);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes?recruitmentId=${recruitmentId}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to access your private recruitment notes.");
          setLoading(false);
          return;
        }
        throw new Error("Failed to load notes");
      }
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistInput.trim()) return;
    setNewChecklist([
      ...newChecklist,
      {
        id: "item-" + Date.now(),
        text: newChecklistInput.trim(),
        isDone: false,
      },
    ]);
    setNewChecklistInput("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setNewChecklist(newChecklist.filter((item) => item.id !== id));
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setError("Please write some note content.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          title: newTitle.trim() || null,
          content: newContent.trim(),
          isPinned: newIsPinned,
          checklist: newChecklist.length > 0 ? newChecklist : null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save note");
      }

      const d = await res.json();
      setNotes([d.note, ...notes]);
      setIsCreating(false);
      setNewTitle("");
      setNewContent("");
      setNewIsPinned(false);
      setNewChecklist([]);
      setNewChecklistInput("");
    } catch (err: any) {
      setError(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      const newPinState = !note.isPinned;
      // Optimistic update
      setNotes(
        notes.map((n) =>
          n.id === note.id ? { ...n, isPinned: newPinState } : n
        )
      );

      const res = await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          isPinned: newPinState,
        }),
      });

      if (!res.ok) {
        fetchNotes(); // Revert on failure
      }
    } catch {
      fetchNotes();
    }
  };

  const handleToggleChecklistItem = async (
    note: Note,
    itemId: string
  ) => {
    if (!note.checklist) return;
    const updatedChecklist = note.checklist.map((item) =>
      item.id === itemId ? { ...item, isDone: !item.isDone } : item
    );

    // Optimistic update
    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, checklist: updatedChecklist } : n
      )
    );

    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          checklist: updatedChecklist,
        }),
      });
    } catch {
      fetchNotes();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this private note?")) return;
    try {
      setNotes(notes.filter((n) => n.id !== noteId));
      await fetch(`/api/notes?id=${noteId}`, { method: "DELETE" });
    } catch {
      fetchNotes();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="notes-modal-title"
                className="text-lg font-bold text-white flex items-center gap-2"
              >
                Private Workspace & Notes
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Confidential
                </span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                {recruitmentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Disclosure Notice */}
        <div className="px-5 py-2.5 bg-purple-950/30 border-b border-purple-900/30 flex items-center gap-2 text-xs text-purple-300">
          <Lock className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <span>
            These notes are strictly private to your account. They are never
            shared with government exam boards or other candidates.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Create Note Trigger / Form */}
          {!isCreating ? (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <Plus className="w-4 h-4" />
                Add Private Note or Task
              </button>

              <span className="text-xs text-slate-400">
                {notes.length} {notes.length === 1 ? "note" : "notes"} recorded
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleCreateNote}
              className="p-4 bg-slate-800/70 border border-purple-500/30 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> New Private Note
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <Pin className="w-3.5 h-3.5 text-purple-400" /> Pin to top
                </label>
              </div>

              {/* Quick Template Suggestions */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  Quick Examples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewContent(tmpl)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-white transition-colors text-left"
                    >
                      {tmpl.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Note Title (Optional, e.g. Document Verification Checklist)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Content input */}
              <textarea
                rows={3}
                placeholder="Write your personal notes, reminders, or preparation observations..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />

              {/* Embedded Checklist builder */}
              <div className="space-y-2 pt-1 border-t border-slate-700/60">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> Add
                  Action Items (Optional)
                </span>

                {newChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/80 rounded-lg text-xs"
                  >
                    <span className="text-slate-200 line-clamp-1">
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Bring 4 stamp photos & Aadhaar"
                    value={newChecklistInput}
                    onChange={(e) => setNewChecklistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-white transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTitle("");
                    setNewContent("");
                    setNewChecklist([]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
              <div className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No private notes yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Jot down application to-dos, syllabus reminders, or document
                procurement tasks for this recruitment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border transition-all ${
                    note.isPinned
                      ? "bg-purple-950/20 border-purple-500/40 shadow-sm"
                      : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {note.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Pin className="w-3 h-3 fill-current" /> Pinned
                        </span>
                      )}
                      {note.title && (
                        <h4 className="text-xs font-bold text-white">
                          {note.title}
                        </h4>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note)}
                        title={note.isPinned ? "Unpin note" : "Pin note"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isPinned
                            ? "text-purple-400 bg-purple-500/20 hover:bg-purple-500/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete note"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>

                  {/* Checklist inside note */}
                  {note.checklist && note.checklist.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/50 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Tasks & Action Items:
                      </span>
                      {note.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleChecklistItem(note, item.id)}
                          className="w-full flex items-center gap-2 text-left p-1 rounded hover:bg-slate-700/40 transition-colors text-xs"
                        >
                          {item.isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span
                            className={
                              item.isDone
                                ? "line-through text-slate-500"
                                : "text-slate-200"
                            }
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Updated{" "}
                      {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-purple-400/80">Only you can see this</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">ESC</kbd> to close
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
