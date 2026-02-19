import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Brain, Hash, Clock, Link2, FileText, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "", color: colorOptions[0] });
  const [files, setFiles] = useState<FileList | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      let attachments: string[] = [];
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          // Use a unique path for each file (e.g., userId/timestamp_filename)
          const filePath = `${user!.id}/${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage.from("note-attachments").upload(filePath, file, { upsert: true });
          if (error) throw error;
          // Get public URL
          const { data: urlData } = supabase.storage.from("note-attachments").getPublicUrl(filePath);
          if (urlData?.publicUrl) attachments.push(urlData.publicUrl);
        }
      }
      const { error } = await supabase.from("notes").insert({
        user_id: user!.id,
        title: form.title,
        content: form.content,
        tags,
        color: form.color,
        attachments,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setForm({ title: "", content: "", tags: "", color: colorOptions[0] });
      setFiles(null);
      setOpen(false);
      toast({ title: "Note created!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(null);
      toast({ title: "Note deleted" });
    },
  });

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
          <h1 className="text-3xl font-display font-bold text-foreground">Second Brain</h1>
          <p className="text-muted-foreground mt-1">{notes.length} notes · {allTags.length} topics</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Note</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <input placeholder="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <textarea placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]" />
              <input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Attachments (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={e => setFiles(e.target.files)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {files && files.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">{Array.from(files).map(f => f.name).join(", ")}</div>
                )}
              </div>
              <button type="submit" disabled={addMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Creating..." : "Create Note"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search your second brain..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              All
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                <Hash className="w-3 h-3 inline mr-1" />{tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg font-display">No notes yet</p>
            <p className="text-sm mt-1">Click "New Note" to start building your second brain.</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filtered.map(n => (
            <motion.div key={n.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedNote(n)}
              className={`glass-card rounded-xl p-5 border cursor-pointer hover:border-primary/30 transition-all ${n.color || ''}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
                <Brain className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{n.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(n.tags || []).slice(0, 2).map((t: string) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
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
