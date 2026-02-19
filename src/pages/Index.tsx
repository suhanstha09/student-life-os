import { motion } from "framer-motion";
import { Timer, ClipboardList, Brain, Flame, BookOpen, Plus, ArrowRight, CheckCircle2, Clock, Target, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const priorityColor: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-accent/20 text-accent",
  low: "bg-success/20 text-success",
};

const Index = () => {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";
  const todayStr = today.toISOString().split("T")[0];

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: todaySessions = [] } = useQuery({
    queryKey: ["focus_sessions_today"],
    queryFn: async () => {
      const { data, error } = await supabase.from("focus_sessions").select("*")
        .gte("completed_at", `${todayStr}T00:00:00`).lte("completed_at", `${todayStr}T23:59:59`);
      if (error) throw error;
      return data;
    },
  });

  const focusSessions = todaySessions.filter(s => s.session_type === "focus");
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration_seconds / 60), 0);
  const pendingAssignments = assignments.filter(a => !a.completed);
  const upcomingAssignments = pendingAssignments.slice(0, 4);
  const recentNotes = notes.slice(0, 3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <motion.div variants={item} className="space-y-1">
        <h1 className="text-3xl font-display font-bold text-foreground">{greeting} 👋</h1>
        <p className="text-muted-foreground">Here's your productivity overview for today.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Focus Time Today" value={`${(totalFocusMinutes / 60).toFixed(1)}h`} subtitle={`${focusSessions.length} sessions completed`} icon={Timer} variant="primary" />
        <StatCard title="Assignments Due" value={pendingAssignments.length} subtitle="pending" icon={ClipboardList} />
        <StatCard title="Notes Created" value={notes.length} subtitle="total" icon={Brain} />
        <StatCard title="Sessions Today" value={todaySessions.length} icon={Flame} variant="accent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-foreground">Upcoming Assignments</h2>
            <Link to="/assignments" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No pending assignments. Nice work! 🎉</p>
            )}
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.course}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[a.priority] || ''}`}>{a.priority}</span>
                {a.due_date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />{a.due_date}
                  </div>
                )}
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

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

      {recentNotes.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-xl p-6">
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
                    {(n.tags || []).slice(0, 3).map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Index;
