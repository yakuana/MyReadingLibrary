import { createContext, useContext, useState } from 'react';
import { initialBooks } from '../data/initialBooks';

// 1. Create the context object.
//    Think of this as an empty "container" that will hold our books data.
//    Any component in the tree can reach into this container.
const BooksContext = createContext(null);

// 2. Create the Provider component.
//    This wraps the app and makes the books state available to every
//    child component — no matter how deeply nested — without prop drilling.
export function BooksProvider({ children }) {
  const [books, setBooks] = useState(initialBooks);

  // Add a new book to the list
  function addBook(book) {
    setBooks((prev) => [...prev, book]);
  }

  // Replace a book with updated data (matched by id)
  function updateBook(updatedBook) {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
  }

  // Remove a book by id
  function deleteBook(id) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <BooksContext.Provider value={{ books, addBook, updateBook, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

// 3. Create a custom hook.
//    Instead of calling useContext(BooksContext) directly in every component,
//    we export this hook so components just call useBooks() — cleaner and safer.
export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used inside a BooksProvider');
  }
  return context;
}
