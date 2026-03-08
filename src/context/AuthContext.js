import { createContext, useContext, useState } from 'react';

const OWNER_PASSWORD = process.env.EXPO_PUBLIC_OWNER_PASSWORD;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isOwner, setIsOwner] = useState(false);

  function signIn(password) {
    if (password === OWNER_PASSWORD) {
      setIsOwner(true);
      return true;
    }
    return false;
  }

  function signOut() {
    setIsOwner(false);
  }

  return (
    <AuthContext.Provider value={{ isOwner, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
