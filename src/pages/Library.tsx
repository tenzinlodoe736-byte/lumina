import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library as LibraryIcon, 
  Trash2, 
  ChevronRight, 
  Star, 
  Clock, 
  Sparkles,
  BookOpen,
  Plus,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Book, ReadingStatus } from '../types';
import { storage } from '../lib/storage';
import { gemini } from '../lib/gemini';
import toast from 'react-hot-toast';

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    setBooks(storage.getLibrary());
  }, []);

  const exportToCSV = () => {
    if (books.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Title', 'Authors', 'Status', 'Rating', 'Added At'];
    const rows = books.map(book => [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.authors.join(', ').replace(/"/g, '""')}"`,
      book.status || 'None',
      book.averageRating || 'N/A',
      new Date(book.addedAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lumina_library_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Library data exported successfully');
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const recs = await gemini.getRecommendations(books);
      setRecommendations(recs);
    } catch (err) {
      toast.error('Unable to fetch recommendations');
    } finally {
      setRecLoading(false);
    }
  };

  const removeBook = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    storage.removeBook(id);
    setBooks(storage.getLibrary());
    toast.success('Archive record deleted');
  };

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(b => b.status === filter);

  const stats = {
    total: books.length,
    reading: books.filter(b => b.status === 'reading').length,
    finished: books.filter(b => b.status === 'finished').length,
    wantToRead: books.filter(b => b.status === 'want-to-read').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Private Archives</h2>
          <h1 className="text-6xl font-serif font-black text-white">The Sanctuary</h1>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {['all', 'want-to-read', 'reading', 'finished'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-brand-accent text-black shadow-lg' : 'hover:bg-white/5 text-zinc-500'
              }`}
            >
              {f.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {filteredBooks.length === 0 ? (
            <div className="luxury-card p-12 text-center flex flex-col items-center gap-6 bg-[#0d0d0f]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-700">
                <LibraryIcon size={40} />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold mb-2">The shelves are vacant</h3>
                <p className="text-zinc-500 text-sm italic tracking-wide">Acquire new knowledge from the discovery archives.</p>
              </div>
              <Link 
                to="/" 
                className="px-8 py-3 bg-brand-accent text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
              >
                Enter Discovery
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Link 
                      to={`/book/${book.id}`}
                      className="group flex gap-6 p-4 luxury-card bg-[#0d0d0f] items-center overflow-hidden"
                    >
                      <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/5">
                        <img 
                          src={book.thumbnail} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            book.status === 'reading' ? 'border-brand-accent/30 text-brand-accent' :
                            book.status === 'finished' ? 'border-green-500/30 text-green-500' :
                            'border-zinc-500/30 text-zinc-500'
                          }`}>
                            {book.status?.replace(/-/g, ' ')}
                          </span>
                          <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                            Acquired {new Date(book.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-serif text-2xl font-bold leading-tight truncate mb-1 text-white">{book.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">{book.authors[0]}</p>
                      </div>
                      <div className="flex items-center gap-4 pr-4">
                        <button 
                          onClick={(e) => removeBook(book.id, e)}
                          className="p-3 text-red-500/40 group-hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight className="text-zinc-800 group-hover:text-brand-accent transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Stats Card */}
          <div className="luxury-card p-8 bg-zinc-950 border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-600 flex items-center gap-2">
                <LibraryIcon size={12} />
                Analytics
              </h3>
              <button 
                onClick={exportToCSV}
                className="p-2 text-zinc-600 hover:text-white transition-colors"
                title="Export Data"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-3xl font-serif font-black text-white">{stats.total}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Archived</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-serif font-black text-white">{stats.finished}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Mastered</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-serif font-black text-brand-accent">{stats.reading}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Engaged</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-serif font-black text-white">{stats.wantToRead}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Queued</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-brand-accent/10 to-transparent border border-brand-accent/10 rounded-2xl">
            <p className="text-[10px] text-brand-accent font-black tracking-[0.2em] uppercase mb-1">Knowledge Export</p>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">Export your full library metadata as a structured CSV for external synthesis.</p>
            <button 
              onClick={exportToCSV}
              className="w-full py-3 bg-white/5 border border-brand-accent/20 text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-all"
            >
              Export Global Registry
            </button>
          </div>

          {/* AI Recommendations */}
          <div className="luxury-card p-8 border-brand-accent/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-ink/40 flex items-center gap-2">
                <Sparkles size={12} />
                Curated For You
              </h3>
              <button 
                onClick={fetchRecommendations}
                disabled={stats.total === 0 || recLoading}
                className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-20"
              >
                <Plus size={20} className={recLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((title, i) => (
                  <motion.div 
                    key={title + i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <p className="font-serif font-bold text-brand-ink/80 group-hover:text-brand-accent transition-colors underline decoration-brand-accent/0 group-hover:decoration-brand-accent/100 underline-offset-4">
                      {title}
                    </p>
                    <Plus size={14} className="text-brand-ink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-brand-ink/30 italic text-sm">
                  {stats.total > 0 
                    ? "Click the icon to see your personalized reading path." 
                    : "Add books to your library to unlock AI recommendations."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
