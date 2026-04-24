import { Book, ReadingStatus } from '../types';

const STORAGE_KEY = 'lumina_books_library';

export const storage = {
  getLibrary: (): Book[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBook: (book: Book) => {
    const library = storage.getLibrary();
    const index = library.findIndex(b => b.id === book.id);
    if (index >= 0) {
      library[index] = book;
    } else {
      library.push({ ...book, addedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  },

  removeBook: (id: string) => {
    const library = storage.getLibrary().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  },

  updateStatus: (id: string, status: ReadingStatus) => {
    const library = storage.getLibrary();
    const book = library.find(b => b.id === id);
    if (book) {
      book.status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    }
  },

  getBook: (id: string): Book | undefined => {
    return storage.getLibrary().find(b => b.id === id);
  }
};
