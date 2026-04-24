import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Book as BookIcon, Search, Library as LibraryIcon, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import MyLibrary from './pages/Library';
import BookDetail from './pages/BookDetail';
import Conceptualizer from './pages/Conceptualizer';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Discover', path: '/', icon: Search },
    { name: 'Library', path: '/library', icon: LibraryIcon },
    { name: 'Conceptualizer', path: '/conceptualizer', icon: Sparkles },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center text-amber-500 group-hover:bg-brand-accent group-hover:text-black transition-all">
              <span className="font-serif font-bold">L</span>
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-white">Lumina</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all hover:bg-white/5 ${
                  location.pathname === item.path ? 'text-brand-accent bg-white/5' : 'text-zinc-500'
                }`}
              >
                <item.icon size={14} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-zinc-400" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-surface border-t border-white/5"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium uppercase tracking-widest ${
                    location.pathname === item.path ? 'text-brand-accent bg-white/5' : 'text-zinc-500'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg selection:bg-brand-accent/30">
        <Navigation />
        <main className="pt-20 pb-12 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/conceptualizer" element={<Conceptualizer />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}
