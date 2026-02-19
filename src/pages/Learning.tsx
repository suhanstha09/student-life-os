import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Clock, RotateCcw, Brain, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: "", course: "" });

  const { data: learningItems = [], isLoading } = useQuery({
    queryKey: ["learning_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("learning_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("learning_items").insert({
        user_id: user!.id,
        topic: form.topic,
        course: form.course,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
      setForm({ topic: "", course: "" });
      setOpen(false);
      toast({ title: "Topic added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const item = learningItems.find(i => i.id === id);
      if (!item) return;
      const newMastery = Math.min(100, item.mastery + 10);
      const nextReviewDays = Math.pow(2, item.review_count);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + nextReviewDays);

      const { error } = await supabase.from("learning_items").update({
        mastery: newMastery,
        review_count: item.review_count + 1,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
      toast({ title: "Reviewed! Mastery increased 📈" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning_items"] });
      toast({ title: "Topic deleted" });
    },
  });

  const now = new Date();
  const dueToday = learningItems.filter(i => new Date(i.next_review_at) <= now);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Learning Log</h1>
          <p className="text-muted-foreground mt-1">Spaced repetition · {dueToday.length} due for review</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Topic</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <input placeholder="Topic name" required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="Course (e.g. CS 201)" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="submit" disabled={addMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Adding..." : "Add Topic"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

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
                <button onClick={() => reviewMutation.mutate(i.id)}
                  className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90 transition-colors">
                  Review Now
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={item} className="space-y-3">
        {learningItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-display">No topics yet</p>
            <p className="text-sm mt-1">Click "Add Topic" to start tracking your learning.</p>
          </div>
        )}
        {learningItems.map(i => (
          <div key={i.id} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMasteryBg(i.mastery)}/10`}>
                <BookOpen className={`w-5 h-5 ${getMasteryColor(i.mastery)}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{i.topic}</h3>
                  {i.course && <span className="text-xs text-muted-foreground">· {i.course}</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {formatDistanceToNow(new Date(i.last_reviewed_at), { addSuffix: true })}</span>
                  <span>{i.review_count} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-lg font-display font-bold ${getMasteryColor(i.mastery)}`}>{i.mastery}%</span>
                  <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${i.mastery}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${getMasteryBg(i.mastery)}`} />
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(i.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Learning;
