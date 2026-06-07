import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
  Video, Shield, Zap, Globe, Users, MessageSquare,
  ChevronRight, Star, ArrowRight, Play, Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  }),
};

const features = [
  { icon: Zap, title: 'Ultra-Low Latency', desc: 'Sub-50ms real-time communication powered by WebRTC mesh architecture.', color: '#C9A84C' },
  { icon: Shield, title: 'End-to-End Encrypted', desc: 'Military-grade encryption on every stream. Your calls, your data.', color: '#8B9FE8' },
  { icon: Globe, title: 'Global Infrastructure', desc: 'STUN/TURN servers across 40+ regions for crystal-clear calls anywhere.', color: '#7ECBA1' },
  { icon: Users, title: 'Multi-Party Rooms', desc: 'Host up to 100 participants in a single session with adaptive quality.', color: '#E87C8B' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Real-time in-room messaging with instant delivery and history.', color: '#C9A84C' },
  { icon: Video, title: 'Screen Sharing', desc: 'Share your screen in one click. Present, teach, collaborate.', color: '#8B9FE8' },
];

const stats = [
  { value: '< 50ms', label: 'Avg. Latency' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '100+', label: 'Participants/Room' },
  { value: '128-bit', label: 'Encryption' },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen mesh-bg text-white">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(138,100,50,0.06) 0%, transparent 70%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm font-mono text-gold">Now in Public Beta — Free Forever</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-display text-6xl md:text-8xl font-bold leading-[1.05] mb-6">
            <span className="block text-white/90">Video calls that</span>
            <span className="block text-shimmer">feel like presence.</span>
            <span className="block text-founder">(founder - VANSH MALIK)</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Enterprise-grade WebRTC infrastructure wrapped in an interface so refined,
            you'll forget you're on a call. Built for teams that demand the best.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register"
              className="group btn-gold text-obsidian font-semibold px-8 py-4 rounded-xl flex items-center gap-2 text-base">
              Start for Free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login"
              className="px-8 py-4 rounded-xl glass border border-white/10 hover:border-gold/30 transition-all text-white/70 hover:text-white flex items-center gap-2 text-base">
              <Play size={16} className="fill-current" />
              Watch Demo
            </Link>
          </motion.div>

          {/* Hero mock - video call UI */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="relative max-w-5xl mx-auto">
            <div className="glass rounded-2xl border border-white/10 p-3 shadow-2xl"
              style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.1)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 text-center text-xs font-mono text-white/20">velora.meet / room / X4F9K2</div>
              </div>
              {/* Video grid */}
              <div className="grid grid-cols-3 gap-2 h-64 md:h-80">
                {[
                  { name: 'Sarah K.', color: '#C9A84C', active: true },
                  { name: 'Dev M.', color: '#7ECBA1', active: false },
                  { name: 'Priya S.', color: '#8B9FE8', active: false },
                ].map((p, i) => (
                  <motion.div key={i}
                    animate={{ scale: p.active ? [1, 1.002, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}15, ${p.color}05)`,
                      border: p.active ? `1px solid ${p.color}50` : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: p.active ? `0 0 20px ${p.color}20` : 'none',
                    }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold"
                        style={{ background: `${p.color}20`, color: p.color }}>
                        {p.name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {p.active && <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
                      <span className="text-xs text-white/60 font-sans">{p.name}</span>
                    </div>
                    {p.active && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold border border-gold/30">
                        Speaking
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-3 py-2">
                {['🎤', '📷', '🖥️', '💬'].map((icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-sm cursor-pointer hover:border-gold/30 transition-all">
                    {icon}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-sm cursor-pointer">
                  📵
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-4 -right-4 glass-gold rounded-xl px-4 py-3 hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Users size={14} className="text-gold" />
              </div>
              <div>
                <div className="text-xs text-white/50">Live Now</div>
                <div className="text-sm font-semibold text-gold">2,847 calls</div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }}
              className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-3 hidden md:flex items-center gap-2 border border-white/10">
              <div className="flex -space-x-2">
                {['#C9A84C', '#7ECBA1', '#8B9FE8'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-obsidian flex items-center justify-center text-xs font-bold"
                    style={{ background: `${c}30`, color: c }}>
                    {['S', 'D', 'P'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs text-white/50">Connected</div>
                <div className="text-xs font-mono text-green-400">● 42ms latency</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i}
              viewport={{ once: true }} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gold-gradient mb-1">{s.value}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-20">
            <div className="text-sm font-mono text-gold/70 tracking-widest uppercase mb-4">Built Different</div>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white/90 leading-tight">
              Everything you need.<br />
              <span className="text-gold-gradient">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i * 0.5}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all cursor-default group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-lg text-white/90 mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-20">
            <div className="text-sm font-mono text-gold/70 tracking-widest uppercase mb-4">Simple by Design</div>
            <h2 className="font-display text-5xl font-bold text-white/90">Ready in 3 steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create an account', desc: 'Sign up in under 30 seconds. No credit card.' },
              { step: '02', title: 'Create or join a room', desc: 'Generate a unique room ID or paste one to join.' },
              { step: '03', title: 'Start your call', desc: 'Crystal-clear video and audio, instantly.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i}
                viewport={{ once: true }} className="text-center">
                <div className="font-mono text-6xl font-bold text-gold/20 mb-4">{s.step}</div>
                <h3 className="text-xl font-semibold text-white/90 mb-3">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BLOCK ── */}
      <section className="py-32 px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-gold rounded-3xl p-16"
          style={{ boxShadow: '0 0 80px rgba(201,168,76,0.1)' }}>
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-gold fill-gold" />
            ))}
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Start your first call<br />in under a minute.
          </h2>
          <p className="text-white/50 mb-10">No downloads. No plugins. Just open your browser.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="btn-gold text-obsidian font-semibold px-10 py-4 rounded-xl flex items-center justify-center gap-2">
              Create Free Account <ChevronRight size={18} />
            </Link>
            <Link to="/login"
              className="px-10 py-4 rounded-xl border border-white/15 hover:border-gold/30 transition-all text-white/60 hover:text-white flex items-center justify-center gap-2">
              Sign In
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/30">
            {['Free forever', 'No credit card', 'Cancel anytime'].map((t, i) => (
              <span key={i} className="flex items-center gap-1"><Check size={12} className="text-gold" /> {t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
