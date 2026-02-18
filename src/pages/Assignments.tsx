import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, CheckCircle2, Circle, Clock, 
  AlertTriangle, ChevronDown, Calendar, Tag 
} from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  course: string;
  due: string;
  priority: "high" | "medium" | "low";
  progress: number;
  completed: boolean;
  description: string;
}

const initialAssignments: Assignment[] = [
  { id: 1, title: "Data Structures Essay", course: "CS 201", due: "2025-02-19", priority: "high", progress: 75, completed: false, description: "Write a 2000-word essay on binary search trees and their applications." },
  { id: 2, title: "Calculus Problem Set 4", course: "MATH 301", due: "2025-02-21", priority: "medium", progress: 30, completed: false, description: "Complete problems 1-20 from Chapter 7." },
  { id: 3, title: "History Research Paper", course: "HIST 105", due: "2025-02-23", priority: "low", progress: 10, completed: false, description: "Research paper on the causes of the French Revolution." },
  { id: 4, title: "Physics Lab Report", course: "PHY 202", due: "2025-02-25", priority: "medium", progress: 0, completed: false, description: "Lab report on momentum conservation experiment." },
  { id: 5, title: "Literature Review", course: "ENG 102", due: "2025-02-15", priority: "high", progress: 100, completed: true, description: "Review of Shakespeare's influence on modern drama." },
  { id: 6, title: "Database Design Project", course: "CS 305", due: "2025-02-28", priority: "high", progress: 45, completed: false, description: "Design and implement a relational database for a library system." },
];

const priorityConfig = {
  high: { color: "bg-destructive/20 text-destructive", icon: AlertTriangle, label: "High" },
  medium: { color: "bg-accent/20 text-accent", icon: Clock, label: "Medium" },
  low: { color: "bg-success/20 text-success", icon: Circle, label: "Low" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const Assignments = () => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

  const filtered = assignments
    .filter(a => filter === "all" || (filter === "active" ? !a.completed : a.completed))
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.course.toLowerCase().includes(search.toLowerCase()));

  const toggleComplete = (id: number) => {
    setAssignments(prev => prev.map(a => 
      a.id === id ? { ...a, completed: !a.completed, progress: !a.completed ? 100 : a.progress } : a
    ));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">{assignments.filter(a => !a.completed).length} pending · {assignments.filter(a => a.completed).length} completed</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex rounded-lg bg-secondary border border-border overflow-hidden">
          {(["all", "active", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Assignment List */}
      <motion.div variants={item} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((a) => {
            const pConfig = priorityConfig[a.priority];
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card rounded-xl p-5 transition-all ${a.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleComplete(a.id)} className="mt-0.5 flex-shrink-0">
                    {a.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-medium text-foreground ${a.completed ? "line-through" : ""}`}>{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pConfig.color}`}>
                        {pConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{a.course}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{a.due}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground">{a.progress}%</span>
                    <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
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
