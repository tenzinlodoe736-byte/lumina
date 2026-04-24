import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import toast from 'react-hot-toast';

const Home = () => {
  const [query, setQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const searchBooks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query && !authorQuery) return;

    setLoading(true);
    try {
      let fullQuery = query;
      if (authorQuery) {
        fullQuery += `+inauthor:${encodeURIComponent(authorQuery)}`;
      }
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(fullQuery || query)}&maxResults=20`);
      const data = await res.json();
      
      if (data.items) {
        const formattedBooks: Book[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['Unknown'],
          description: item.volumeInfo.description || 'No description available.',
          thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1543005128-d14339967727?q=80&w=300&auto=format&fit=crop',
          publishedDate: item.volumeInfo.publishedDate,
          categories: item.volumeInfo.categories,
          averageRating: item.volumeInfo.averageRating,
          pageCount: item.volumeInfo.pageCount,
          addedAt: new Date().toISOString()
        }));
        setBooks(formattedBooks);
      } else {
        setBooks([]);
        toast.error('No books found');
      }
    } catch (err) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for featured books
    const initialFetch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=10`);
        const data = await res.json();
        if (data.items) {
          const formattedBooks: Book[] = data.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ['Unknown'],
            description: item.volumeInfo.description || 'No description available.',
            thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1543005128-d14339967727?q=80&w=300&auto=format&fit=crop',
            addedAt: new Date().toISOString()
          }));
          setBooks(formattedBooks);
        }
      } catch (err) {}
      setLoading(false);
    };
    initialFetch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden mb-12">
        <img 
          src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000&auto=format&fit=crop" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/90 to-transparent flex flex-col justify-center px-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-serif font-black text-white max-w-2xl leading-tight mb-6"
          >
            The Architect <br /> of Your Legacy.
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 max-w-xl"
          >
            <div className="flex items-center gap-4 bg-[#121214] border border-white/10 p-2 rounded-full shadow-2xl focus-within:border-brand-accent/50 transition-colors">
              <Search className="ml-4 text-zinc-500 flex-shrink-0" size={18} />
              <form onSubmit={searchBooks} className="flex-1">
                <input 
                  type="text" 
                  placeholder="Titles or literary concepts..." 
                  className="w-full px-2 py-3 bg-transparent outline-none text-zinc-200 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-4 bg-[#121214] border border-white/10 p-2 rounded-full shadow-2xl focus-within:border-brand-accent/50 transition-colors">
                <span className="ml-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest whitespace-nowrap">By Author</span>
                <input 
                  type="text" 
                  placeholder="Author name..." 
                  className="w-full px-2 py-2 bg-transparent outline-none text-zinc-200 text-xs"
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                />
              </div>
              <button 
                onClick={() => searchBooks()}
                className="bg-brand-accent text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105"
              >
                Express Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter & Results */}
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Curated Archives</h2>
            <h3 className="text-4xl font-serif font-bold text-white">Latest Intelligence</h3>
          </div>
          <div className="flex gap-2">
            {['All', 'Romance', 'Noir', 'Philosophy', 'Cyberpunk'].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f.toLowerCase());
                  setQuery(f);
                  searchBooks();
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f.toLowerCase() ? 'bg-brand-accent text-black' : 'bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-brand-accent" size={48} />
            <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Accessing global lexicon...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {books.map((book, idx) => (
              <motion.div
                key={book.id + idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/book/${book.id}`} className="group block h-full luxury-card p-4 bg-[#0d0d0f]">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-2xl border border-white/5">
                    <img 
                      src={book.thumbnail} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-brand-accent text-[10px] font-black uppercase tracking-widest">Open Archive</span>
                    </div>
                  </div>
                  <h4 className="font-serif font-bold text-lg leading-tight line-clamp-1 mb-1 text-white">{book.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3">{book.authors[0]}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="fill-brand-accent text-brand-accent" />
                      <span className="text-[10px] font-black text-zinc-400">{book.averageRating || '?.?'}</span>
                    </div>
                    <BookOpen size={12} className="text-zinc-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
