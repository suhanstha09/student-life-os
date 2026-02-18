import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Target, Flame, Brain, ClipboardList, Calendar } from "lucide-react";

const weeklyData = [
  { day: "Mon", focus: 4.5, assignments: 2, notes: 3 },
  { day: "Tue", focus: 3.2, assignments: 1, notes: 5 },
  { day: "Wed", focus: 5.1, assignments: 3, notes: 2 },
  { day: "Thu", focus: 2.8, assignments: 0, notes: 4 },
  { day: "Fri", focus: 4.0, assignments: 2, notes: 1 },
  { day: "Sat", focus: 1.5, assignments: 1, notes: 0 },
  { day: "Sun", focus: 3.7, assignments: 1, notes: 3 },
];

const maxFocus = Math.max(...weeklyData.map(d => d.focus));

const monthlyStats = [
  { label: "Total Focus", value: "96.4h", icon: Clock, change: "+12%", positive: true },
  { label: "Assignments Done", value: "24", icon: ClipboardList, change: "+8%", positive: true },
  { label: "Notes Created", value: "47", icon: Brain, change: "+23%", positive: true },
  { label: "Best Streak", value: "14 days", icon: Flame, change: "+40%", positive: true },
];

const topCourses = [
  { course: "CS 201", hours: 28.5, percentage: 30 },
  { course: "MATH 301", hours: 22.1, percentage: 23 },
  { course: "PHY 202", hours: 18.3, percentage: 19 },
  { course: "HIST 105", hours: 15.7, percentage: 16 },
  { course: "ENG 102", hours: 11.8, percentage: 12 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Analytics = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your productivity insights and trends.</p>
      </motion.div>

      {/* Monthly Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {monthlyStats.map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${stat.positive ? "text-success" : "text-destructive"}`}>
                  {stat.change} this month
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Focus Chart */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground">Weekly Focus Hours</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Focus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Assignments</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground mb-1">{d.focus}h</span>
                <div className="w-full flex flex-col gap-1" style={{ height: `${(d.focus / maxFocus) * 100}%` }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="w-full bg-primary/30 rounded-t-md relative overflow-hidden flex-1"
                  >
                    <div className="absolute inset-0 bg-primary/50 rounded-t-md" />
                  </motion.div>
                </div>
                <span className="text-xs text-muted-foreground mt-2">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Courses */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-5">Top Courses</h2>
          <div className="space-y-4">
            {topCourses.map((c, i) => (
              <div key={c.course}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{c.course}</span>
                  <span className="text-xs text-muted-foreground">{c.hours}h</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="h-full bg-primary rounded-full"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div variants={item} className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-semibold text-foreground">Activity Heatmap</h2>
          <span className="text-xs text-muted-foreground">Last 12 weeks</span>
        </div>
        <div className="grid grid-cols-12 gap-1.5">
          {Array.from({ length: 84 }).map((_, i) => {
            const intensity = Math.random();
            let bg = "bg-secondary";
            if (intensity > 0.8) bg = "bg-primary";
            else if (intensity > 0.6) bg = "bg-primary/60";
            else if (intensity > 0.4) bg = "bg-primary/30";
            else if (intensity > 0.2) bg = "bg-primary/10";
            return (
              <div key={i} className={`aspect-square rounded-sm ${bg} transition-colors hover:ring-1 hover:ring-primary/50`} />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/10" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
