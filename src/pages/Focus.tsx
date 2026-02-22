import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Target, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type SessionType = "focus" | "shortBreak" | "longBreak";

const sessionConfig: Record<SessionType, { duration: number; label: string; color: string }> = {
  focus: { duration: 25 * 60, label: "Focus", color: "text-primary" },
  shortBreak: { duration: 5 * 60, label: "Short Break", color: "text-success" },
  longBreak: { duration: 15 * 60, label: "Long Break", color: "text-accent" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const Focus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [customFocusMinutes, setCustomFocusMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(sessionConfig.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const config = sessionConfig[sessionType];
  // If focus session, use custom duration
  const effectiveDuration = sessionType === "focus" ? customFocusMinutes * 60 : config.duration;

  const { data: todaySessions = [] } = useQuery({
    queryKey: ["focus_sessions_today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase.from("focus_sessions")
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

  const saveMutation = useMutation({
    mutationFn: async (durationSeconds: number) => {
      const { error } = await supabase.from("focus_sessions").insert({
        user_id: user!.id,
        session_type: sessionType,
        duration_seconds: durationSeconds,
      });
      if (error) {
        console.error("Supabase focus_sessions insert error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus_sessions_today"] });
      toast({ title: "Session completed! 🎉" });
    },
  });

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / effectiveDuration;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);
  // Update timer when session type or custom duration changes
  useEffect(() => {
    setTimeLeft(effectiveDuration);
  }, [sessionType, effectiveDuration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
        const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : config.duration;
        startTimeRef.current = null;
        saveMutation.mutate(elapsed);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const switchSession = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    if (type === "focus") {
      setTimeLeft(customFocusMinutes * 60);
    } else {
      setTimeLeft(sessionConfig[type].duration);
    }
    startTimeRef.current = null;
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(effectiveDuration);
    startTimeRef.current = null;
  };

  const focusSessions = todaySessions.filter(s => s.session_type === "focus");
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration_seconds / 60), 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      {sessionType === "focus" && (
        <div className="mb-8 flex items-center justify-center">
          <label htmlFor="focus-minutes" className="text-base font-medium text-foreground mr-3">Focus Minutes:</label>
          <input
            id="focus-minutes"
            type="number"
            min={1}
            max={180}
            value={customFocusMinutes}
            onChange={e => setCustomFocusMinutes(Number(e.target.value))}
            className="w-24 px-4 py-2 rounded-lg border border-border bg-secondary text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm disabled:opacity-60"
            disabled={isRunning}
          />
        </div>
      )}
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-foreground">Focus Session</h1>
        <p className="text-muted-foreground mt-1">Deep work, distraction-free.</p>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="flex rounded-xl bg-secondary border border-border overflow-hidden">
          {(Object.keys(sessionConfig) as SessionType[]).map(type => (
            <button key={type} onClick={() => switchSession(type)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${sessionType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {type === "focus" && <Target className="w-4 h-4 inline mr-2" />}
              {type !== "focus" && <Coffee className="w-4 h-4 inline mr-2" />}
              {sessionConfig[type].label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="relative">
          <svg width="320" height="320" className="-rotate-90">
            <circle cx="160" cy="160" r="140" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <motion.circle cx="160" cy="160" r="140" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-display font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</span>
            <span className={`text-sm font-medium mt-2 ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex justify-center gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={() => setIsRunning(!isRunning)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRunning ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={() => { reset(); switchSession(sessionType === "focus" ? "shortBreak" : "focus"); }}
          className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="glass-card rounded-xl p-6 flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-foreground">{focusSessions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Sessions Today</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-display font-bold gradient-text">{(totalFocusMinutes / 60).toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground mt-1">Focus Time</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Focus;
