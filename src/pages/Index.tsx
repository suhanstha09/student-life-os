import { motion } from "framer-motion";
import { Timer, ClipboardList, Brain, Flame, BookOpen, Plus, ArrowRight, CheckCircle2, Clock, Target, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import Motivation from "@/components/Motivation";
import StreakCounter from "@/components/StreakCounter";
import WeeklyProgressRing from "@/components/WeeklyProgressRing";
import WeeklyGoalSettings from "@/components/WeeklyGoalSettings";
import UpcomingDeadlines from "@/components/UpcomingDeadlines";
import { useAuth } from "@/contexts/AuthContext";
import { useAssignments } from "@/hooks/useAssignments";
import { useNotes } from "@/hooks/useNotes";
import { useFocusSessionsToday } from "@/hooks/useFocusSessions";
import { useProfile } from "@/hooks/useProfile";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const priorityColor: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-accent/20 text-accent",
  low: "bg-success/20 text-success",
};

const Index = () => {

  const { user } = useAuth();
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

  const { data: profile } = useProfile();
  const { data: assignments = [] } = useAssignments();
  const { data: notes = [] } = useNotes();
  const { data: todaySessions = [] } = useFocusSessionsToday();

  const focusSessions = todaySessions.filter(s => s.session_type === "focus");
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration_seconds / 60), 0);
  const pendingAssignments = assignments.filter(a => !a.completed);
  const upcomingAssignments = pendingAssignments.slice(0, 4);
  const recentNotes = notes.slice(0, 3);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <Motivation />
      <StreakCounter />
      <WeeklyGoalSettings />
      <WeeklyProgressRing />
      <UpcomingDeadlines assignments={assignments} />
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
          {greeting}
          {profile?.display_name ? `, ${profile.display_name}` : user?.email ? `, ${user.email}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-lg">Here's your productivity overview for today.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Focus Time Today" value={`${(totalFocusMinutes / 60).toFixed(1)}h`} subtitle={`${focusSessions.length} sessions completed`} icon={Timer} variant="primary" />
        <StatCard title="Assignments Due" value={pendingAssignments.length} subtitle="pending" icon={ClipboardList} />
        <StatCard title="Notes Created" value={notes.length} subtitle="total" icon={Brain} />
        <StatCard title="Sessions Today" value={todaySessions.length} icon={Flame} variant="accent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">Upcoming Assignments</h2>
              <p className="text-xs text-muted-foreground mt-1">Next deadlines to focus on</p>
            </div>
            <Link to="/assignments" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-smooth">
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

        <motion.div variants={item} className="glass-card rounded-2xl p-6 card-hover">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/focus" className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 transition-smooth text-primary group border border-primary/10">
              <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Start Focus Session</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>
            <Link to="/assignments" className="flex items-center gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth text-foreground group">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-smooth" />
              <span className="text-sm font-semibold">Add Assignment</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link to="/notes" className="flex items-center gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth text-foreground group">
              <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm font-semibold">New Note</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground group-hover:text-accent" />
            </Link>
          </div>
        </motion.div>
      </div>

      {recentNotes.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">Recent Notes</h2>
              <p className="text-xs text-muted-foreground mt-1">Your latest learning</p>
            </div>
            <Link to="/notes" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-smooth">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((n) => (
              <div key={n.id} className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth cursor-pointer group">
                <div className="flex items-start justify-between">
                  <Brain className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-muted-foreground">{n.title.substring(0, 30)}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(n.tags || []).slice(0, 3).map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full badge-primary">{t}</span>
                  ))}
                  {(n.tags || []).length > 3 && (
                    <span className="text-xs px-2.5 py-1 rounded-full badge-primary">+{(n.tags || []).length - 3}</span>
                  )}
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
