import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, BookType, Hash, Loader2, ArrowRight } from 'lucide-react';
import { gemini } from '../lib/gemini';
import { BookIdea } from '../types';
import toast from 'react-hot-toast';

const Conceptualizer = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [ideas, setIdeas] = useState<BookIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (genres.length === 0 && themes.length === 0) {
      toast.error('Please add at least one genre or theme');
      return;
    }
    setLoading(true);
    try {
      const result = await gemini.generateBookIdeas({ genres, themes });
      setIdeas(result);
      toast.success('Concepts synthesized successfully');
    } catch (err) {
      toast.error('Synthesis failed');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'genre' | 'theme') => {
    const value = type === 'genre' ? newGenre : newTheme;
    if (!value) return;
    if (type === 'genre') {
      setGenres([...genres, value]);
      setNewGenre('');
    } else {
      setThemes([...themes, value]);
      setNewTheme('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Creative Suite</h2>
        <h1 className="text-6xl font-serif font-black text-white">Conceptualizer</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="luxury-card p-8 bg-zinc-950 border-white/10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block">Core Genres</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="e.g. Neo-Noir"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-brand-accent/50"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('genre')}
                />
                <button onClick={() => addItem('genre')} className="p-2 bg-brand-accent text-black rounded-xl hover:bg-white transition-all">
                  <BookType size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map(g => (
                  <span key={g} className="px-3 py-1 bg-white/5 text-zinc-400 text-[10px] font-bold rounded-full border border-white/10">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block">Philosophical Themes</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="e.g. Identity"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-brand-accent/50"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('theme')}
                />
                <button onClick={() => addItem('theme')} className="p-2 bg-brand-accent text-black rounded-xl hover:bg-white transition-all">
                  <Hash size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {themes.map(t => (
                  <span key={t} className="px-3 py-1 bg-white/5 text-zinc-400 text-[10px] font-bold rounded-full border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-brand-accent text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-brand-accent/10 hover:bg-white transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              Synthesize Narratives
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {ideas.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6"
              >
                {ideas.map((idea, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="luxury-card p-10 bg-[#0d0d0f] border-brand-accent/10 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                          {idea.genre}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                          Target: {idea.targetAudience}
                        </span>
                      </div>
                      <h3 className="text-4xl font-serif font-black text-white leading-tight">{idea.title}</h3>
                      <p className="font-serif text-xl italic text-zinc-400 leading-relaxed border-l-2 border-white/5 pl-8">
                        {idea.premise}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-4">
                        {idea.themes.map(t => (
                          <span key={t} className="text-[9px] font-black uppercase tracking-widest text-zinc-700"># {t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-zinc-700 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Sparkles size={48} className="mb-6 opacity-20" />
                <p className="font-serif italic text-xl">The conceptual void awaits your input...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Conceptualizer;
