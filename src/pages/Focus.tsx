import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Target, Volume2 } from "lucide-react";

type SessionType = "focus" | "shortBreak" | "longBreak";

const sessionConfig: Record<SessionType, { duration: number; label: string; color: string }> = {
  focus: { duration: 25 * 60, label: "Focus", color: "text-primary" },
  shortBreak: { duration: 5 * 60, label: "Short Break", color: "text-success" },
  longBreak: { duration: 15 * 60, label: "Long Break", color: "text-accent" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Focus = () => {
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState(sessionConfig.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = sessionConfig[sessionType];

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / config.duration;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
        if (sessionType === "focus") setSessions(s => s + 1);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, sessionType]);

  const switchSession = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(sessionConfig[type].duration);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(config.duration);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 relative z-10">
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-foreground">Focus Session</h1>
        <p className="text-muted-foreground mt-1">Deep work, distraction-free.</p>
      </motion.div>

      {/* Session Type Tabs */}
      <motion.div variants={item} className="flex justify-center">
        <div className="flex rounded-xl bg-secondary border border-border overflow-hidden">
          {(Object.keys(sessionConfig) as SessionType[]).map(type => (
            <button
              key={type}
              onClick={() => switchSession(type)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                sessionType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "focus" && <Target className="w-4 h-4 inline mr-2" />}
              {type === "shortBreak" && <Coffee className="w-4 h-4 inline mr-2" />}
              {type === "longBreak" && <Coffee className="w-4 h-4 inline mr-2" />}
              {sessionConfig[type].label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Timer */}
      <motion.div variants={item} className="flex justify-center">
        <div className="relative">
          <svg width="320" height="320" className="-rotate-90">
            <circle cx="160" cy="160" r="140" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <motion.circle
              cx="160" cy="160" r="140" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-display font-bold text-foreground tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className={`text-sm font-medium mt-2 ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div variants={item} className="flex justify-center gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRunning
              ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
          }`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={() => { reset(); switchSession(sessionType === "focus" ? "shortBreak" : "focus"); }} className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Session Stats */}
      <motion.div variants={item} className="flex justify-center">
        <div className="glass-card rounded-xl p-6 flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-foreground">{sessions}</p>
            <p className="text-xs text-muted-foreground mt-1">Sessions Today</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-display font-bold gradient-text">{(sessions * 25 / 60).toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground mt-1">Focus Time</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-accent">🔥 7</p>
            <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Focus;
