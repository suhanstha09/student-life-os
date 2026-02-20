// src/components/WeeklyProgressRing.tsx
import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday as week start
  return d;
}

const WEEKLY_GOAL_MINUTES = 600; // Example: 10 hours

const WeeklyProgressRing: React.FC = () => {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWeekly = async () => {
      setLoading(true);
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

  const percent = Math.min(100, (minutes / WEEKLY_GOAL_MINUTES) * 100);
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center mb-4">
      <div className="relative w-20 h-20">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#6366f1"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary mb-1" />
          <span className="font-bold text-lg">{loading ? "..." : Math.round(percent) + "%"}</span>
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">Weekly Goal</span>
    </div>
  );
};

export default WeeklyProgressRing;
