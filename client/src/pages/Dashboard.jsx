import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogIn, Video, Users, Clock, Copy, Check, LogOut, Hash, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'

  const createRoom = async () => {
    setError('');
    setLoading('create');
    try {
      const { room } = await roomAPI.create(roomName || 'My Room', token);
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const joinRoom = async () => {
    const id = joinId.trim().toUpperCase();
    if (!id) return;
    navigate(`/room/${id}`);
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const quickRoomNames = ['Design Review', 'Team Standup', 'Client Demo', '1:1 Session'];

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Video size={16} className="text-gold" />
            </div>
            <span className="font-display text-lg font-bold text-shimmer">Velora Meet</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/60 text-sm hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm">
              <LogOut size={16} /> <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-gold" />
            <span className="text-sm font-mono text-gold/70">Dashboard</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white/90 mb-2">
            Good to see you,<br />
            <span className="text-gold-gradient">{user?.name?.split(' ')[0]}.</span>
          </h1>
          <p className="text-white/40">Start a meeting or join one with a room code.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Create / Join */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            {/* Tab selector */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
                {['create', 'join'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium capitalize transition-all"
                    style={activeTab === tab
                      ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#080808' }
                      : { color: 'rgba(255,255,255,0.4)' }}>
                    {tab === 'create' ? '+ Create Room' : '→ Join Room'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'create' ? (
                  <motion.div key="create" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                    <label className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2 block">
                      Room Name (optional)
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={e => setRoomName(e.target.value)}
                      placeholder="e.g. Design Review"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 text-sm mb-3"
                      onKeyDown={e => e.key === 'Enter' && createRoom()}
                    />
                    {/* Quick names */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {quickRoomNames.map(n => (
                        <button key={n} onClick={() => setRoomName(n)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 text-white/40 hover:text-white/70 text-xs transition-all">
                          {n}
                        </button>
                      ))}
                    </div>
                    <motion.button onClick={createRoom} disabled={loading === 'create'}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full btn-gold text-obsidian font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                      {loading === 'create'
                        ? <><div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" /> Creating...</>
                        : <><Plus size={18} /> Create New Room</>}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="join" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    <label className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2 block">
                      Room ID
                    </label>
                    <div className="relative mb-6">
                      <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={joinId}
                        onChange={e => setJoinId(e.target.value.toUpperCase())}
                        placeholder="Enter 8-character room code"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder:text-white/20 text-sm font-mono tracking-widest"
                        maxLength={8}
                        onKeyDown={e => e.key === 'Enter' && joinRoom()}
                      />
                    </div>
                    <motion.button onClick={joinRoom} disabled={!joinId.trim()}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      className="w-full btn-gold text-obsidian font-semibold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                      <LogIn size={18} /> Join Room
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-4 text-center">
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Right - Info cards */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="space-y-4">
            {/* Quick tip */}
            <div className="glass-gold rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <Video size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90 mb-1">How rooms work</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Create a room to get a unique 8-character ID. Share it with anyone — they can join instantly, no account needed for guests.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Max participants', value: '100' },
                { icon: Clock, label: 'Call duration', value: 'Unlimited' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-xl p-5 border border-white/5">
                  <s.icon size={20} className="text-gold mb-3" />
                  <div className="text-xl font-bold text-white/90 font-display mb-0.5">{s.value}</div>
                  <div className="text-xs text-white/30">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="glass rounded-xl p-5 border border-white/5">
              <h4 className="text-sm font-semibold text-white/60 mb-4 font-mono uppercase tracking-wider">
                Available in calls
              </h4>
              <div className="space-y-2.5">
                {[
                  '🎤 Mute / unmute microphone',
                  '📷 Toggle camera on/off',
                  '🖥️ Share your screen',
                  '💬 In-room live chat',
                  '🔗 Copy & share room link',
                ].map((f, i) => (
                  <div key={i} className="text-sm text-white/50">{f}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
