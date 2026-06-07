import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,8,8,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center transition-all group-hover:bg-gold/30">
            <Video size={18} className="text-gold" />
          </div>
          <span className="font-display text-xl font-bold text-shimmer">Velora Meet</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Docs', href: '#docs' },
          ].map(l => (
            <a key={l.label} href={l.href}
              className="text-white/50 hover:text-white text-sm transition-colors">{l.label}</a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard"
                className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
              <button onClick={() => { logout(); navigate('/'); }}
                className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm transition-all">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-white/60 hover:text-white text-sm transition-colors">Sign in</Link>
              <Link to="/register"
                className="btn-gold text-obsidian text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5">
                Get Started <ChevronRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen(p => !p)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5"
            style={{ background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)' }}>
            <div className="px-6 py-4 space-y-3">
              {[
                { label: 'Features', href: '#' },
                { label: 'Pricing', href: '#' },
              ].map(l => (
                <a key={l.label} href={l.href}
                  className="block text-white/60 hover:text-white py-2 transition-colors">{l.label}</a>
              ))}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                {user ? (
                  <Link to="/dashboard" className="btn-gold text-obsidian font-semibold py-3 rounded-xl text-center">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-white/60 hover:text-white py-2 text-center transition-colors">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-gold text-obsidian font-semibold py-3 rounded-xl text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
