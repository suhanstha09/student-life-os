// src/components/StreakCounter.tsx
import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

const StreakCounter: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStreak = async () => {
      setLoading(true);
      // Fetch all unique days with a focus session
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (error || !data) {
        setStreak(0);
        setLoading(false);
        return;
      }
      // Get unique days
      const days = Array.from(new Set(data.map((s: any) => s.completed_at.split("T")[0])));
      // Calculate streak
      let streakCount = 0;
      let current = new Date(getTodayStr());
      for (let day of days) {
        if (day === current.toISOString().split("T")[0]) {
          streakCount++;
          current.setDate(current.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(streakCount);
      setLoading(false);
    };
    fetchStreak();
  }, [user]);

  return (
    <div className="flex items-center gap-2 bg-accent/30 rounded-lg px-4 py-2 mb-2 w-fit">
      <Flame className="w-5 h-5 text-accent" />
      <span className="font-semibold text-accent">Streak:</span>
      <span className="font-bold text-lg">{loading ? "..." : streak}</span>
      <span className="text-xs text-muted-foreground ml-1">days in a row</span>
    </div>
  );
};

export default StreakCounter;
