import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Star, 
  Heart,
  Loader2,
  Bookmark,
  Languages
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Book, StorySummary, ReadingStatus } from '../types';
import { gemini } from '../lib/gemini';
import { storage } from '../lib/storage';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<StorySummary | null>(null);
  const [dictionaryWord, setDictionaryWord] = useState<{word: string, meaning: string} | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        const item = await res.json();
        const formatted: Book = {
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['Unknown'],
          description: item.volumeInfo.description?.replace(/<[^>]*>?/gm, '') || 'No description available.',
          thumbnail: item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          publishedDate: item.volumeInfo.publishedDate,
          categories: item.volumeInfo.categories,
          averageRating: item.volumeInfo.averageRating,
          pageCount: item.volumeInfo.pageCount,
          addedAt: new Date().toISOString()
        };
        
        // Check if already in library
        const saved = storage.getBook(id!);
        setBook(saved || formatted);
      } catch (err) {
        toast.error('Failed to load book details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const runAnalysis = async () => {
    if (!book) return;
    setAiLoading(true);
    try {
      const analysis = await gemini.getStorySummary(book);
      setAiAnalysis(analysis);
    } catch (err) {
      toast.error('AI Architect is resting right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = (status: ReadingStatus) => {
    if (!book) return;
    const updatedBook = { ...book, status };
    storage.saveBook(updatedBook);
    setBook(updatedBook);
    toast.success(`Book marked as ${status.replace(/-/g, ' ')}`);
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.split(' ').length <= 3) {
      setLookupLoading(true);
      try {
        const meaning = await gemini.lookupWord(selection, book?.description || '');
        setDictionaryWord({ word: selection, meaning });
      } catch (err) {
        toast.error('Scholar tool failed');
      } finally {
        setLookupLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" size={64} />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12"
      >
        <ArrowLeft size={18} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Depart Archive</span>
      </button>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left: Visuals & Actions */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="flex flex-col gap-3">
            <div className="luxury-card p-6 bg-zinc-950/50 space-y-4">
              <p className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-600 text-center">Your Rating</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      if (!book) return;
                      const updatedBook = { ...book, userRating: star };
                      storage.saveBook(updatedBook);
                      setBook(updatedBook);
                      toast.success(`Rated ${star} stars`);
                    }}
                    className="transition-transform hover:scale-125"
                  >
                    <Star 
                      size={24} 
                      className={`${
                        (book.userRating || 0) >= star 
                          ? 'fill-brand-accent text-brand-accent' 
                          : 'text-zinc-800'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {['want-to-read', 'reading', 'finished'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as ReadingStatus)}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black transition-all ${
                  book.status === status 
                    ? 'bg-brand-accent text-black border border-brand-accent' 
                    : 'bg-white/5 border border-white/5 hover:border-white/20 text-zinc-500 hover:text-white'
                }`}
              >
                {book.status === status ? <Check size={14} /> : <Plus size={14} />}
                {status.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          <div className="luxury-card p-6 grid grid-cols-2 gap-4 bg-zinc-950/50">
            <div className="text-center p-4 border-r border-white/5">
              <p className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-600 mb-1">Critique</p>
              <div className="flex items-center justify-center gap-1">
                <Star size={14} className="fill-brand-accent text-brand-accent" />
                <span className="font-serif text-xl font-bold text-white">{book.averageRating || '?.?'}</span>
              </div>
            </div>
            <div className="text-center p-4">
              <p className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-600 mb-1">Extent</p>
              <div className="flex items-center justify-center gap-1 font-serif text-xl font-bold text-white">
                <BookOpen size={14} className="text-zinc-600" />
                <span>{book.pageCount || '???'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-8 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-7xl font-serif font-black leading-tight text-white">{book.title}</h1>
            <p className="text-2xl font-serif italic text-zinc-500">by {book.authors.join(', ')}</p>
            
            <div className="flex flex-wrap gap-2 pt-4">
              {book.categories?.map((cat) => (
                <span key={cat} className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                  {cat}
                </span>
              ))}
            </div>
          </motion.div>

          {/* AI Architect Section */}
          <div className="relative p-10 rounded-3xl bg-[#0d0d0f] border border-white/5 text-white overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles size={160} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-brand-accent">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white tracking-tight">AI Story Analyst</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Model: Gemini Intelligence</p>
                  </div>
                </div>
                {!aiAnalysis && (
                  <button 
                    onClick={runAnalysis}
                    disabled={aiLoading}
                    className="px-8 py-3 bg-brand-accent text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    {aiLoading ? 'Synthesizing...' : 'Analytic Synthesis'}
                  </button>
                )}
              </div>

              {aiLoading && (
                <div className="space-y-4 py-8">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-accent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-700">Deconstructing literary structure...</p>
                </div>
              )}

              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-brand-accent text-[9px] uppercase font-black tracking-[0.4em]">The Core Narrative</h4>
                      <div className="prose prose-invert prose-zinc text-zinc-400 font-serif text-lg leading-relaxed italic border-l border-white/10 pl-6">
                        <ReactMarkdown>{aiAnalysis.summary}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-brand-accent text-[9px] uppercase font-black tracking-[0.4em] mb-4">Thematic Pillars</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.themes.map(t => (
                            <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-medium tracking-wide text-zinc-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-brand-accent text-[9px] uppercase font-black tracking-[0.4em] mb-3">Atmospheric Tone</h4>
                        <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase">{aiAnalysis.vibe}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Full Exposition</h3>
            <div 
              className="font-serif text-2xl leading-relaxed text-zinc-400 select-text cursor-help selection:bg-brand-accent/30"
              onMouseUp={handleTextSelection}
            >
              {book.description}
              <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                <Languages size={14} className="text-brand-accent" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  Select fragments for Lexicon Lookup via Integrated Scholar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dictionary Modal */}
      <AnimatePresence>
        {dictionaryWord && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] w-[400px] bg-dark-surface border border-white/10 p-8 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button 
                onClick={() => setDictionaryWord(null)}
                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                  <Languages size={20} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-[0.4em] text-zinc-700 leading-none mb-1">Lexicon Insight</p>
                  <h4 className="font-serif text-3xl font-black text-white">{dictionaryWord.word}</h4>
                </div>
              </div>
              <div className="font-serif text-zinc-400 text-lg leading-relaxed italic border-l-2 border-brand-accent/40 pl-6 bg-white/[0.02] py-4 rounded-r-xl">
                <ReactMarkdown>{dictionaryWord.meaning}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookDetail;
