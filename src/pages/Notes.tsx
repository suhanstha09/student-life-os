import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Brain, Hash, Clock, Link2, FileText, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotes, useAddNote, useDeleteNote } from "@/hooks/useNotes";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const colorOptions = [
  "bg-primary/10 border-primary/20",
  "bg-accent/10 border-accent/20",
  "bg-success/10 border-success/20",
  "bg-destructive/10 border-destructive/20",
];

const Notes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "", color: colorOptions[0] });
  const [files, setFiles] = useState<FileList | null>(null);

  const { data: notes = [], isLoading } = useNotes();
  const addMutation = useAddNote();
  const deleteMutation = useDeleteNote();

  const handleAdd = async () => {
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      await addMutation.mutateAsync({
        title: form.title,
        content: form.content,
        tags,
        color: form.color,
        attachments: [],
        files,
      });
      setForm({ title: "", content: "", tags: "", color: colorOptions[0] });
      setFiles(null);
      setOpen(false);
      toast({ title: "Note created!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];
  const filtered = notes
    .filter(n => !selectedTag || (n.tags || []).includes(selectedTag))
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || (n.content || "").toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Second Brain</h1>
          <p className="text-muted-foreground mt-2 text-sm">{notes.length} notes · {allTags.length} topics</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Note</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <input placeholder="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-base" />
              <textarea placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="textarea-base" />
              <input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="input-base" />
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Attachments (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={e => setFiles(e.target.files)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:btn-primary input-base"
                />
                {files && files.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">{Array.from(files).map(f => f.name).join(", ")}</div>
                )}
              </div>
              <button type="submit" disabled={addMutation.isPending}
                className="w-full btn-primary">
                {addMutation.isPending ? "Creating..." : "Create Note"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search your second brain..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-base pl-10" />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth ${!selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              All
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth flex items-center gap-1 ${selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                <Hash className="w-3 h-3" />{tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-display font-semibold">No notes yet</p>
            <p className="text-sm mt-2">Click "New Note" to start building your second brain.</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filtered.map(n => (
            <motion.div key={n.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedNote(n)}
              className={`glass-card rounded-2xl p-6 border cursor-pointer hover:border-primary/40 transition-smooth card-hover ${n.color || ''}`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground line-clamp-2 text-lg">{n.title}</h3>
                <Brain className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{n.content}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex gap-1.5 flex-wrap">
                  {(n.tags || []).slice(0, 2).map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full badge-primary">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedNote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-foreground">{selectedNote.title}</h2>
                <button onClick={() => deleteMutation.mutate(selectedNote.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                {(selectedNote.tags || []).map((t: string) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">{selectedNote.content}</p>
              {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="font-medium text-foreground mb-1">Attachments:</div>
                  {selectedNote.attachments.map((url: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={url} alt="attachment" className="w-24 h-24 object-cover rounded border" />
                      ) : url.match(/\.pdf$/i) ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">
                          <FileText className="w-4 h-4" /> PDF File
                        </a>
                      ) : (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Download</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notes;
