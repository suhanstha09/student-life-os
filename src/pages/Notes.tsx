import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Brain, Hash, Clock, Link2, FileText } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  updatedAt: string;
  color: string;
}

const initialNotes: Note[] = [
  { id: 1, title: "Binary Search Trees", content: "A BST is a node-based binary tree data structure where each node has at most two children. The left subtree contains only nodes with keys less than the parent...", tags: ["CS", "Algorithms", "Trees"], links: ["Sorting Algorithms"], updatedAt: "2h ago", color: "bg-primary/10 border-primary/20" },
  { id: 2, title: "Integration by Parts", content: "∫u dv = uv - ∫v du. Choose u using LIATE: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential...", tags: ["Math", "Calculus"], links: ["Chain Rule"], updatedAt: "5h ago", color: "bg-accent/10 border-accent/20" },
  { id: 3, title: "French Revolution Causes", content: "Financial crisis of 1789, social inequality under the Ancien Régime, Enlightenment ideas spreading through the population...", tags: ["History", "Europe"], links: ["Enlightenment"], updatedAt: "Yesterday", color: "bg-success/10 border-success/20" },
  { id: 4, title: "Sorting Algorithms", content: "Quick Sort: O(n log n) average, O(n²) worst. Merge Sort: O(n log n) always. Heap Sort: O(n log n) with O(1) space...", tags: ["CS", "Algorithms"], links: ["Binary Search Trees"], updatedAt: "2 days ago", color: "bg-primary/10 border-primary/20" },
  { id: 5, title: "Quantum Mechanics Basics", content: "Wave-particle duality, Schrödinger's equation, uncertainty principle. The wave function ψ describes the quantum state...", tags: ["Physics", "Quantum"], links: [], updatedAt: "3 days ago", color: "bg-destructive/10 border-destructive/20" },
  { id: 6, title: "Chain Rule", content: "If y = f(g(x)), then dy/dx = f'(g(x)) · g'(x). Essential for differentiating composite functions...", tags: ["Math", "Calculus"], links: ["Integration by Parts"], updatedAt: "4 days ago", color: "bg-accent/10 border-accent/20" },
];

const allTags = [...new Set(initialNotes.flatMap(n => n.tags))];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const Notes = () => {
  const [notes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filtered = notes
    .filter(n => !selectedTag || n.tags.includes(selectedTag))
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative z-10">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Second Brain</h1>
          <p className="text-muted-foreground mt-1">{notes.length} notes · {allTags.length} topics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </motion.div>

      {/* Search & Tags */}
      <motion.div variants={item} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your second brain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Hash className="w-3 h-3 inline mr-1" />{tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notes Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(n => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedNote(n)}
              className={`glass-card rounded-xl p-5 border cursor-pointer hover:border-primary/30 transition-all ${n.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
                <Brain className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{n.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {n.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {n.links.length > 0 && (
                    <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{n.links.length}</span>
                  )}
                  <span><Clock className="w-3 h-3 inline" /> {n.updatedAt}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-foreground">{selectedNote.title}</h2>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex gap-2 mb-4">
                {selectedNote.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{t}</span>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">{selectedNote.content}</p>
              {selectedNote.links.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Linked Notes</p>
                  <div className="flex gap-2">
                    {selectedNote.links.map(l => (
                      <span key={l} className="text-sm px-3 py-1.5 rounded-lg bg-secondary text-foreground flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-primary" />{l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notes;
