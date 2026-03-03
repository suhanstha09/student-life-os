import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Clock, RotateCcw, Brain, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useLearningItems, useAddLearningItem, useReviewLearningItem, useDeleteLearningItem } from "@/hooks/useLearningItems";

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
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ topic: "", course: "" });

  const { data: learningItems = [], isLoading } = useLearningItems();
  const addMutation = useAddLearningItem();
  const reviewMutation = useReviewLearningItem();
  const deleteMutation = useDeleteLearningItem();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync(form);
      setForm({ topic: "", course: "" });
      setOpen(false);
      toast({ title: "Topic added!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleReview = (id: string) => {
    const item = learningItems.find(i => i.id === id);
    if (!item) return;
    reviewMutation.mutate({
      id,
      currentMastery: item.mastery,
      reviewCount: item.review_count,
    });
    toast({ title: "Reviewed! Mastery increased 📈" });
  };

  const now = new Date();
  const dueToday = learningItems.filter(i => new Date(i.next_review_at) <= now);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Learning Log</h1>
          <p className="text-muted-foreground mt-2 text-sm">Spaced repetition · {dueToday.length} due for review</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary">
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">New Topic</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <input placeholder="Topic name" required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                className="input-base" />
              <input placeholder="Course (e.g. CS 201)" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                className="input-base" />
              <button type="submit" disabled={addMutation.isPending}
                className="w-full btn-primary">
                {addMutation.isPending ? "Adding..." : "Add Topic"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {dueToday.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-2xl p-6 border border-accent/20 card-hover">
          <div className="flex items-center gap-2 mb-5">
            <RotateCcw className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-display font-semibold text-foreground">Due for Review</h2>
            <span className="text-xs px-3 py-1 rounded-full badge-accent">{dueToday.length}</span>
          </div>
          <div className="space-y-3">
            {dueToday.map(i => (
              <div key={i.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth group">
                <Brain className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{i.topic}</p>
                  <p className="text-xs text-muted-foreground">{i.course}</p>
                </div>
                <button onClick={() => handleReview(i.id)}
                  className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-smooth whitespace-nowrap">
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
          <div key={i.id} className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMasteryBg(i.mastery)}/10`}>
                <BookOpen className={`w-6 h-6 ${getMasteryColor(i.mastery)}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{i.topic}</h3>
                  {i.course && <span className="text-xs text-muted-foreground">· {i.course}</span>}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {formatDistanceToNow(new Date(i.last_reviewed_at), { addSuffix: true })}</span>
                  <span>{i.review_count} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-2xl font-display font-bold ${getMasteryColor(i.mastery)}`}>{i.mastery}%</span>
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${i.mastery}%` }} transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${getMasteryBg(i.mastery)}`} />
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(i.id)} className="text-muted-foreground hover:text-destructive transition-smooth ml-2">
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
