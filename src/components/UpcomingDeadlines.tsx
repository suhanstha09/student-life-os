// src/components/UpcomingDeadlines.tsx
import React from "react";
import { Clock } from "lucide-react";

function getUrgencyColor(daysLeft: number) {
  if (daysLeft <= 1) return "bg-destructive/20 text-destructive";
  if (daysLeft <= 3) return "bg-accent/20 text-accent";
  return "bg-success/20 text-success";
}

const UpcomingDeadlines = ({ assignments = [] }: { assignments: any[] }) => {
  const now = new Date();
  const upcoming = assignments
    .filter((a) => a.due_date && !a.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 4)
    .map((a) => {
      const due = new Date(a.due_date);
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      return { ...a, daysLeft };
    });

  if (upcoming.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <h2 className="text-lg font-display font-semibold text-foreground mb-4">Upcoming Deadlines</h2>
      <div className="space-y-3">
        {upcoming.map((a) => (
          <div key={a.id} className={`flex items-center gap-4 p-3 rounded-lg ${getUrgencyColor(a.daysLeft)} transition-colors`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">Due: {a.due_date} ({a.daysLeft} day{a.daysLeft !== 1 ? "s" : ""} left)</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-background/80 border border-border">{a.course}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
