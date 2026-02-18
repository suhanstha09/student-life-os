import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, CheckCircle2, Clock, RotateCcw, Brain } from "lucide-react";

interface LearningItem {
  id: number;
  topic: string;
  course: string;
  lastReviewed: string;
  nextReview: string;
  mastery: number;
  reviewCount: number;
}

const learningItems: LearningItem[] = [
  { id: 1, topic: "Big O Notation", course: "CS 201", lastReviewed: "Today", nextReview: "In 3 days", mastery: 85, reviewCount: 5 },
  { id: 2, topic: "Derivative Rules", course: "MATH 301", lastReviewed: "Yesterday", nextReview: "Tomorrow", mastery: 72, reviewCount: 4 },
  { id: 3, topic: "WW2 Timeline", course: "HIST 105", lastReviewed: "2 days ago", nextReview: "Today", mastery: 60, reviewCount: 3 },
  { id: 4, topic: "Newton's Laws", course: "PHY 202", lastReviewed: "3 days ago", nextReview: "Today", mastery: 45, reviewCount: 2 },
  { id: 5, topic: "SQL Joins", course: "CS 305", lastReviewed: "1 week ago", nextReview: "Overdue", mastery: 30, reviewCount: 1 },
  { id: 6, topic: "Poetic Devices", course: "ENG 102", lastReviewed: "Today", nextReview: "In 5 days", mastery: 90, reviewCount: 7 },
];

const getMasteryColor = (m: number) => {
  if (m >= 80) return "text-success";
  if (m >= 50) return "text-accent";
  return "text-destructive";
};

const getMasteryBg = (m: number) => {
  if (m >= 80) return "bg-success";
  if (m >= 50) return "bg-accent";
  return "bg-destructive";
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Learning = () => {
  const dueToday = learningItems.filter(i => i.nextReview === "Today" || i.nextReview === "Overdue");
  
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Learning Log</h1>
          <p className="text-muted-foreground mt-1">Spaced repetition · {dueToday.length} due for review</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </motion.div>

      {/* Due Today */}
      {dueToday.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-xl p-6 border border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-display font-semibold text-foreground">Due for Review</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">{dueToday.length}</span>
          </div>
          <div className="space-y-2">
            {dueToday.map(i => (
              <div key={i.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Brain className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{i.topic}</p>
                  <p className="text-xs text-muted-foreground">{i.course}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors">
                  Review Now
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Topics */}
      <motion.div variants={item} className="space-y-3">
        {learningItems.map(i => (
          <div key={i.id} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMasteryBg(i.mastery)}/10`}>
                <BookOpen className={`w-5 h-5 ${getMasteryColor(i.mastery)}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{i.topic}</h3>
                  <span className="text-xs text-muted-foreground">· {i.course}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {i.lastReviewed}</span>
                  <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" />Next: {i.nextReview}</span>
                  <span>{i.reviewCount} reviews</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-lg font-display font-bold ${getMasteryColor(i.mastery)}`}>{i.mastery}%</span>
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${i.mastery}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${getMasteryBg(i.mastery)}`}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Learning;
