import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle, Calendar, Tag, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAssignments, useAddAssignment, useToggleAssignment, useDeleteAssignment } from "@/hooks/useAssignments";

const priorityConfig = {
  high: { color: "bg-destructive/20 text-destructive", icon: AlertTriangle, label: "High" },
  medium: { color: "bg-accent/20 text-accent", icon: Clock, label: "Medium" },
  low: { color: "bg-success/20 text-success", icon: Circle, label: "Low" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Assignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", course: "", due_date: "", priority: "medium" as string });

  const { data: assignments = [], isLoading } = useAssignments();
  const addMutation = useAddAssignment();
  const toggleMutation = useToggleAssignment();
  const deleteMutation = useDeleteAssignment();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({
        user_id: user!.id,
        title: form.title,
        description: form.description,
        course: form.course,
        due_date: form.due_date || null,
        priority: form.priority,
      });
      setForm({ title: "", description: "", course: "", due_date: "", priority: "medium" });
      setOpen(false);
      toast({ title: "Assignment added!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filtered = assignments
    .filter(a => filter === "all" || (filter === "active" ? !a.completed : a.completed))
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.course.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">{assignments.filter(a => !a.completed).length} pending · {assignments.filter(a => a.completed).length} completed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Assignment</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <input placeholder="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="Course (e.g. CS 201)" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" />
              <div className="flex gap-3">
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" disabled={addMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Adding..." : "Add Assignment"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex rounded-lg bg-secondary border border-border overflow-hidden">
          {(["all", "active", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-display">No assignments yet</p>
            <p className="text-sm mt-1">Click "Add Assignment" to get started.</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filtered.map((a) => {
            const pConfig = priorityConfig[a.priority as keyof typeof priorityConfig] || priorityConfig.medium;
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card rounded-xl p-5 transition-all ${a.completed ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleMutation.mutate({ id: a.id, completed: a.completed, progress: a.progress })} className="mt-0.5 flex-shrink-0">
                    {a.completed ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-medium text-foreground ${a.completed ? "line-through" : ""}`}>{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pConfig.color}`}>{pConfig.label}</span>
                    </div>
                    {a.description && <p className="text-sm text-muted-foreground mb-3">{a.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {a.course && <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{a.course}</span>}
                      {a.due_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{a.due_date}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-foreground">{a.progress}%</span>
                      <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${a.progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full" />
                      </div>
                    </div>
                    <button onClick={() => deleteMutation.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Assignments;
