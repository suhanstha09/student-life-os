// src/components/WeeklyGoalSettings.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const WeeklyGoalSettings: React.FC = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState(600); // default 10 hours
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("weekly_goals")
      .select("goal_minutes")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (data && data.goal_minutes) setGoal(data.goal_minutes);
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("weekly_goals")
      .upsert({ user_id: user.id, goal_minutes: goal }, { onConflict: ["user_id"] });
    setStatus(error ? "Error updating goal" : "Goal updated!");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 mb-6 flex flex-col gap-4 max-w-xs">
      <label className="font-semibold text-foreground">Weekly Goal (minutes)</label>
      <input
        type="number"
        min={1}
        value={goal}
        onChange={e => setGoal(Number(e.target.value))}
        className="input border border-border rounded-lg px-3 py-2 text-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={loading}
        placeholder="Enter minutes"
      />
      <button type="submit" className="btn bg-primary text-white rounded-lg py-2 font-bold" disabled={loading}>
        {loading ? "Saving..." : "Save Goal"}
      </button>
      {status && <span className="text-sm text-success mt-2">{status}</span>}
    </form>
  );
};

export default WeeklyGoalSettings;
