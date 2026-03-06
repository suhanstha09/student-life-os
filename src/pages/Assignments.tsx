import React, { useState } from "react";
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
        // ...existing code...
        const { data: assignments = [], isLoading } = useAssignments();
        // Notification helper
        const notifyAssignment = (assignment: any, type: "dueSoon" | "overdue") => {
          if ("Notification" in window && Notification.permission === "granted") {
            const title = type === "dueSoon" ? `Assignment due soon: ${assignment.title}` : `Assignment overdue: ${assignment.title}`;
            const body = `Course: ${assignment.course}\nDue: ${assignment.due_date}`;
            new Notification(title, { body });
          }
        };
        // Request notification permission on mount
        React.useEffect(() => {
          if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
          }
        }, []);
        // Notify for assignments due soon or overdue
        React.useEffect(() => {
          if (!assignments || assignments.length === 0) return;
          const now = new Date();
          assignments.forEach(a => {
            if (!a.due_date || a.completed) return;
            const due = new Date(a.due_date);
            const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursLeft <= 24 && hoursLeft > 0) {
              notifyAssignment(a, "dueSoon");
            } else if (hoursLeft <= 0) {
              notifyAssignment(a, "overdue");
            }
          });
        }, [assignments]);
      // Assignment templates
      const assignmentTemplates = [
        { title: "Essay", description: "Write an essay on a given topic.", course: "English", priority: "medium" },
        { title: "Lab Report", description: "Complete the lab report for this week.", course: "Chemistry", priority: "high" },
        { title: "Homework", description: "Solve assigned problems.", course: "Math", priority: "low" },
        // Add more templates as needed
      ];
    // Course color map (example, expand as needed)
    const courseColors: Record<string, string> = {
      "CS 201": "bg-blue-500 text-white",
      "Math": "bg-green-500 text-white",
      "Physics": "bg-purple-500 text-white",
      "Chemistry": "bg-pink-500 text-white",
      // Add more courses/colors as needed
    };
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "week" | "month" | "overdue">("all");
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

  // Date filtering helpers
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const filtered = assignments
    .filter(a => {
      if (filter === "all") return true;
      if (filter === "active") return !a.completed;
      if (filter === "completed") return a.completed;
      if (filter === "week") {
        if (!a.due_date) return false;
        const due = new Date(a.due_date);
        return due >= startOfWeek && due <= endOfWeek;
      }
      if (filter === "month") {
        if (!a.due_date) return false;
        const due = new Date(a.due_date);
        return due >= startOfMonth && due <= endOfMonth;
      }
      if (filter === "overdue") {
        if (!a.due_date) return false;
        const due = new Date(a.due_date);
        return !a.completed && due < now;
      }
      return true;
    })
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.course.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-2 text-sm">{assignments.filter(a => !a.completed).length} pending · {assignments.filter(a => a.completed).length} completed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Assignment</DialogTitle></DialogHeader>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Use Template:</label>
              <div className="flex gap-2 flex-wrap">
                {assignmentTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="badge-primary"
                    onClick={() => setForm(f => ({ ...f, ...tpl }))}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <input placeholder="Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-base" />
              <input placeholder="Course (e.g. CS 201)" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                className="input-base" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="textarea-base" />
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
                className="w-full btn-primary">
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
          {(["all", "active", "completed", "week", "month", "overdue"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f === "week" ? "This Week" : f === "month" ? "This Month" : f === "overdue" ? "Overdue" : f}
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
            // Progress update handler
            const handleProgressChange = (progress: number) => {
              toggleMutation.mutate({ id: a.id, completed: a.completed, progress });
            };
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
                      {a.course && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${courseColors[a.course] || "bg-secondary text-foreground"}`}>
                          <Tag className="w-3.5 h-3.5" />{a.course}
                        </span>
                      )}
                      {a.due_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{a.due_date}</span>}
                    </div>
                    {/* Progress slider */}
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={a.progress}
                        onChange={e => handleProgressChange(Number(e.target.value))}
                        className="w-32 h-2 accent-primary"
                        disabled={toggleMutation.isPending}
                      />
                      <span className="text-xs text-foreground font-semibold">{a.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
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
