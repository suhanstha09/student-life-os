import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFocusSessionsToday = () => {
  return useQuery({
    queryKey: ["focus_sessions_today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`)
        .order("completed_at", { ascending: false });
      if (error) {
        console.error("Supabase focus_sessions fetch error:", error);
        throw error;
      }
      return data;
    },
  });
};

export const useFocusSessionsAll = () => {
  return useQuery({
    queryKey: ["focus_sessions_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveFocusSession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      session_type: "focus" | "shortBreak" | "longBreak";
      duration_seconds: number;
    }) => {
      const { error } = await supabase.from("focus_sessions").insert({
        user_id: user!.id,
        session_type: input.session_type,
        duration_seconds: input.duration_seconds,
      });
      if (error) {
        console.error("Supabase focus_sessions insert error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus_sessions_today"] });
      queryClient.invalidateQueries({ queryKey: ["focus_sessions_all"] });
    },
  });
};
