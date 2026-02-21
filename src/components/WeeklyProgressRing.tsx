// src/components/WeeklyProgressRing.tsx
import React, { useEffect, useState } from "react";
import { TrendingUp, CheckCircle2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday as week start
  return d;
}


const WeeklyProgressRing: React.FC = () => {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [goal, setGoal] = useState(600); // default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch weekly goal
    supabase
      .from("weekly_goals")
      .select("goal_minutes")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && data.goal_minutes) setGoal(data.goal_minutes);
      });
    // Fetch weekly progress
    const fetchWeekly = async () => {
      const weekStart = getWeekStart();
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("duration_seconds,completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", `${weekStartStr}T00:00:00`);
      if (error || !data) {
        setMinutes(0);
        setLoading(false);
        return;
      }
      const total = data.reduce((sum: number, s: any) => sum + (s.duration_seconds / 60), 0);
      setMinutes(total);
      setLoading(false);
    };
    fetchWeekly();
  }, [user]);

  const percent = Math.min(100, (minutes / goal) * 100);

  return (
    <div className="flex flex-col items-center justify-center mb-4">
      <div className="w-64 p-6 bg-background/80 border border-border shadow rounded-xl flex flex-col items-center">
        {percent >= 100 ? (
          <CheckCircle2 className="w-7 h-7 text-success mb-1 animate-bounce" />
        ) : (
          <Flame className="w-7 h-7 text-primary mb-1 animate-pulse" />
        )}
        <span className="font-bold text-2xl tracking-tight text-foreground mt-1">
          {loading ? "..." : `${Math.round(minutes)}/${goal} min`}
        </span>
        <div className="w-full bg-muted-foreground/20 rounded-lg h-4 mt-4 mb-2">
          <div
            className="bg-primary h-4 rounded-lg transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{loading ? "" : `${Math.round(percent)}%`}</span>
      </div>
      <span className="text-sm text-muted-foreground mt-2">
        {percent >= 100
          ? "Goal complete! 🎉"
          : percent >= 70
            ? "Almost there! Keep going!"
            : percent >= 30
              ? "Great start!"
              : "Let's get started!"}
      </span>
    </div>
  );
};

export default WeeklyProgressRing;
