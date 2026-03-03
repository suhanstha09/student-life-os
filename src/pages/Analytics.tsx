import { motion } from "framer-motion";
import { Clock, Brain, ClipboardList, Flame, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAssignments } from "@/hooks/useAssignments";
import { useNotes } from "@/hooks/useNotes";
import { useFocusSessionsAll } from "@/hooks/useFocusSessions";
import { useLearningItems } from "@/hooks/useLearningItems";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Analytics = () => {
  const { data: assignments = [] } = useAssignments();
  const { data: notes = [] } = useNotes();
  const { data: sessions = [] } = useFocusSessionsAll();
  const { data: learningItems = [] } = useLearningItems();

  const focusSessions = sessions.filter(s => s.session_type === "focus");
  const totalFocusHours = focusSessions.reduce((sum, s) => sum + (s.duration_seconds / 3600), 0);
  const completedAssignments = assignments.filter(a => a.completed).length;

  const stats = [
    { label: "Total Focus", value: `${totalFocusHours.toFixed(1)}h`, icon: Clock },
    { label: "Assignments Done", value: `${completedAssignments}`, icon: ClipboardList },
    { label: "Notes Created", value: `${notes.length}`, icon: Brain },
    { label: "Topics Tracked", value: `${learningItems.length}`, icon: Flame },
  ];

  // Compute course breakdown from assignments
  const courseCounts: Record<string, number> = {};
  assignments.forEach(a => {
    if (a.course) courseCounts[a.course] = (courseCounts[a.course] || 0) + 1;
  });
  const topCourses = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([course, count]) => ({ course, count, percentage: assignments.length ? Math.round((count / assignments.length) * 100) : 0 }));

  // Weekly sessions (last 7 days)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const weeklyData = weekDays.map(d => {
    const dayStr = d.toISOString().split("T")[0];
    const daySessions = focusSessions.filter(s => s.completed_at.startsWith(dayStr));
    const hours = daySessions.reduce((sum, s) => sum + (s.duration_seconds / 3600), 0);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), hours };
  });
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 1);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <motion.div variants={item}>
        <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your productivity insights and trends.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-3">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-2xl p-6 card-hover">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">Weekly Focus Hours</h2>
            <p className="text-xs text-muted-foreground mb-6">Your focus sessions for the past 7 days</p>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground mb-1">{d.hours.toFixed(1)}h</span>
                <div className="w-full flex flex-col gap-1" style={{ height: `${(d.hours / maxHours) * 100}%`, minHeight: 4 }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: "100%" }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="w-full bg-primary/30 rounded-t-md relative overflow-hidden flex-1">
                    <div className="absolute inset-0 bg-primary/50 rounded-t-md" />
                  </motion.div>
                </div>
                <span className="text-xs text-muted-foreground mt-2">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl p-6 card-hover">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">Top Courses</h2>
            <p className="text-xs text-muted-foreground mb-5">Assignments breakdown</p>
          </div>
          {topCourses.length === 0 && <p className="text-sm text-muted-foreground">No courses tracked yet.</p>}
          <div className="space-y-5">
            {topCourses.map((c, i) => (
              <div key={c.course}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{c.course}</span>
                  <span className="text-xs badge-primary">{c.count} assignments</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
