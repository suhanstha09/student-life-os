import { motion } from "framer-motion";
import { 
  Timer, ClipboardList, Brain, BarChart3, Flame, BookOpen,
  Plus, ArrowRight, CheckCircle2, Clock, Target, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";

const upcomingAssignments = [
  { id: 1, title: "Data Structures Essay", course: "CS 201", due: "Tomorrow", priority: "high", progress: 75 },
  { id: 2, title: "Calculus Problem Set 4", course: "MATH 301", due: "In 3 days", priority: "medium", progress: 30 },
  { id: 3, title: "History Research Paper", course: "HIST 105", due: "In 5 days", priority: "low", progress: 10 },
  { id: 4, title: "Physics Lab Report", course: "PHY 202", due: "In 7 days", priority: "medium", progress: 0 },
];

const recentNotes = [
  { id: 1, title: "Binary Search Trees", tags: ["CS", "Algorithms"], time: "2h ago" },
  { id: 2, title: "Integration by Parts", tags: ["Math", "Calculus"], time: "5h ago" },
  { id: 3, title: "French Revolution Causes", tags: ["History"], time: "Yesterday" },
];

const weeklyFocus = [
  { day: "Mon", hours: 4.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 5.1 },
  { day: "Thu", hours: 2.8 },
  { day: "Fri", hours: 4.0 },
  { day: "Sat", hours: 1.5 },
  { day: "Sun", hours: 3.7 },
];

const maxHours = Math.max(...weeklyFocus.map(d => d.hours));

const priorityColor: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-accent/20 text-accent",
  low: "bg-success/20 text-success",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      {/* Header */}
      <motion.div variants={item} className="space-y-1">
        <h1 className="text-3xl font-display font-bold text-foreground">{greeting} 👋</h1>
        <p className="text-muted-foreground">Here's your productivity overview for today.</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Focus Time Today" value="3.5h" subtitle="2 sessions completed" icon={Timer} variant="primary" trend={{ value: 12, positive: true }} />
        <StatCard title="Assignments Due" value={4} subtitle="2 this week" icon={ClipboardList} />
        <StatCard title="Notes Created" value={12} subtitle="This week" icon={Brain} trend={{ value: 8, positive: true }} />
        <StatCard title="Day Streak" value="7 🔥" icon={Flame} variant="accent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-foreground">Upcoming Assignments</h2>
            <Link to="/assignments" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.course}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[a.priority]}`}>
                  {a.priority}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {a.due}
                </div>
                {/* Progress bar */}
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Focus Chart */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-foreground">Weekly Focus</h2>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyFocus.map((d, i) => (
              <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.hours / maxHours) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-t-md bg-primary/20 relative overflow-hidden min-h-[4px]"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-primary/40 rounded-t-md" />
                </motion.div>
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total this week</span>
              <span className="text-sm font-semibold text-foreground">24.8h</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notes */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Notes</h2>
            <Link to="/notes" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotes.map((n) => (
              <div key={n.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <div className="flex gap-2 mt-1">
                    {n.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{n.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/focus" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary group">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Start Focus Session</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/assignments" className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground group">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Add Assignment</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </Link>
            <Link to="/notes" className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground group">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">New Note</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Index;
