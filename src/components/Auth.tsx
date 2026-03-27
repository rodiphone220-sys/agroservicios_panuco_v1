import React, { useState, useEffect } from 'react';
import { userStorage, initializeDemoData } from '../lib/localStorage';
import { User } from '../types';
import { Tractor, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signInDemo: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
    
    // Check for existing session and restore Firebase Auth
    const restoreSession = () => {
      const currentUser = userStorage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const signIn = async () => {
    // Google sign-in placeholder - for now just show message
    alert('La integración con Google requiere configuración OAuth. Usa el Usuario Demo por ahora.');
  };

  const signInDemo = async () => {
    const users = userStorage.getAll();
    let demoUser = users.find(u => u.id === 'demo-user');

    if (!demoUser) {
      demoUser = {
        id: 'demo-user',
        name: 'Usuario Demo',
        email: 'demo@farmerparts.com',
        role: 'ADMIN',
      };
      userStorage.add(demoUser);
    }

    userStorage.setCurrentUser(demoUser);
    setUser(demoUser);
  };

  const signOut = async () => {
    userStorage.setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const LoginView: React.FC = () => {
  const { signIn, signInDemo } = React.useContext(AuthContext);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInDemo, setIsSigningInDemo] = useState(false);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignInDemo = async () => {
    if (isSigningInDemo) return;
    setIsSigningInDemo(true);
    try {
      await signInDemo();
    } finally {
      setIsSigningInDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white mb-4 shadow-lg">
            <Tractor size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Farmer Parts</h1>
          <p className="text-gray-500 mt-2">Gestión de Refacciones Agrícolas</p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
            <p className="text-sm text-blue-800">
              Inicia sesión con tu cuenta corporativa para acceder al sistema.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            )}
            {isSigningIn ? 'Iniciando sesión...' : 'Continuar con Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 text-xs uppercase tracking-wider font-bold">
                Opción Rápida
              </span>
            </div>
          </div>

          <button
            onClick={handleSignInDemo}
            disabled={isSigningInDemo}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary border-2 border-primary/20 rounded-xl font-semibold text-white hover:bg-primary/90 hover:border-primary/30 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningInDemo ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {isSigningInDemo ? 'Iniciando sesión demo...' : 'Usar Usuario Demo'}
          </button>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
            <span className="text-amber-600 shrink-0 text-xs font-bold">⚠️</span>
            <p className="text-xs text-amber-800">
              El usuario demo tiene acceso completo. Úsalo solo para pruebas.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
            Powered by Farmer Parts OS
          </p>
        </div>
      </motion.div>
    </div>
  );
};
