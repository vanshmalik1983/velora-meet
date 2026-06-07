import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, X, PhoneOff, Copy, Check, Users, Send,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { getSocket } from '../services/socket';
import VideoTile from '../components/VideoTile';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = getSocket();
  socket.userName = user?.name;

  const {
    localStream, remoteStreams, audioEnabled, videoEnabled, screenSharing,
    getLocalStream, initiateCall, handleOffer, handleAnswer, handleIceCandidate,
    toggleAudio, toggleVideo, startScreenShare, stopScreenShare, cleanupPeerConnections,
  } = useWebRTC();

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const localVideoRef = useRef(null);

  // Set local video src
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize room
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await getLocalStream();
        if (!isMounted) return;

        socket.emit('join-room', {
          roomId,
          userId: user?.id,
          userName: user?.name,
        });
        setJoined(true);
      } catch (err) {
        setError('Could not access camera/microphone. Please allow permissions and refresh.');
      }
    };

    init();
    return () => { isMounted = false; };
  }, [roomId]);

  // Socket event handlers
  useEffect(() => {
    if (!joined) return;

    const onExistingParticipants = ({ participants: existingPeers }) => {
      setParticipants(existingPeers);
      // Initiate calls to all existing participants
      existingPeers.forEach(p => initiateCall(p.socketId, p.userName));
    };

    const onUserJoined = ({ socketId, userName, participants: updatedPeers }) => {
      setParticipants(updatedPeers.filter(p => p.socketId !== socket.id));
    };

    const onUserLeft = ({ socketId, userName }) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    };

    const onChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('existing-participants', onExistingParticipants);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('chat-message', onChatMessage);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    return () => {
      socket.off('existing-participants', onExistingParticipants);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('chat-message', onChatMessage);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
    };
  }, [joined]);

  const sendMessage = () => {
    const text = msgInput.trim();
    if (!text) return;
    socket.emit('send-message', { roomId, message: text, userName: user?.name, userId: user?.id });
    setMsgInput('');
  };

  const handleToggleAudio = () => {
    toggleAudio();
    socket.emit('media-state-change', { roomId, audioEnabled: !audioEnabled, videoEnabled });
  };

  const handleToggleVideo = () => {
    toggleVideo();
    socket.emit('media-state-change', { roomId, audioEnabled, videoEnabled: !videoEnabled });
  };

  const handleScreenShare = async () => {
    if (screenSharing) await stopScreenShare();
    else await startScreenShare();
  };

  const leaveRoom = () => {
    socket.emit('leave-room', { roomId });
    cleanupPeerConnections();
    navigate('/dashboard');
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allStreams = [
    { socketId: 'local', stream: localStream, userName: `${user?.name} (You)`, isLocal: true },
    ...Object.entries(remoteStreams).map(([sid, { stream, userName }]) => ({
      socketId: sid, stream, userName, isLocal: false,
    })),
  ];

  const gridCols = allStreams.length === 1 ? 'grid-cols-1' :
    allStreams.length === 2 ? 'grid-cols-2' :
    allStreams.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  if (error) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-10 text-center max-w-md border border-red-500/20">
          <VideoOff size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-3">Camera Access Required</h2>
          <p className="text-white/50 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')}
            className="btn-gold text-obsidian font-semibold px-6 py-3 rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-obsidian flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/60 text-sm font-mono tracking-wider">{roomId}</span>
          <button onClick={copyRoomLink}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-gold transition-colors">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/30 text-sm">
            <Users size={14} />
            <span>{allStreams.length}</span>
          </div>
          <button onClick={() => setChatOpen(p => !p)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${chatOpen ? 'bg-gold/20 text-gold border border-gold/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <MessageSquare size={15} /> Chat
            {messages.filter(m => !m.system).length > 0 && !chatOpen && (
              <span className="w-4 h-4 rounded-full bg-gold text-obsidian text-xs flex items-center justify-center font-bold">
                {messages.filter(m => !m.system).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className={`grid ${gridCols} gap-3 h-full`}>
            {allStreams.map(({ socketId, stream, userName, isLocal }) => (
              <VideoTile key={socketId} stream={stream} userName={userName}
                isLocal={isLocal} isMuted={isLocal && !audioEnabled}
                isVideoOff={isLocal && !videoEnabled} localVideoRef={isLocal ? localVideoRef : null} />
            ))}
          </div>
        </div>

        {/* Chat sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-l border-white/5 flex flex-col flex-shrink-0 overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)' }}>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-white/60 text-sm font-semibold">Live Chat</span>
                <button onClick={() => setChatOpen(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare size={24} className="text-white/20 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No messages yet</p>
                  </div>
                )}
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    {msg.system ? (
                      <div className="text-center">
                        <span className="text-xs text-white/25 italic">{msg.text}</span>
                      </div>
                    ) : (
                      <div className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-white/30 mb-1 px-1">{msg.userName}</span>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                          msg.userId === user?.id
                            ? 'bg-gold/20 text-gold-light border border-gold/20 rounded-br-sm'
                            : 'bg-white/5 text-white/80 border border-white/8 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-xs text-white/20 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <input
                    type="text"
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white/80 text-sm placeholder:text-white/20 outline-none"
                  />
                  <button onClick={sendMessage} disabled={!msgInput.trim()}
                    className="text-gold disabled:text-white/20 transition-colors hover:text-gold-light">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 py-5 border-t border-white/5 flex-shrink-0 px-6"
        style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)' }}>
        {/* Mute */}
        <ControlBtn active={!audioEnabled} onClick={handleToggleAudio}
          icon={audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          label={audioEnabled ? 'Mute' : 'Unmute'} danger={!audioEnabled} />

        {/* Camera */}
        <ControlBtn active={!videoEnabled} onClick={handleToggleVideo}
          icon={videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          label={videoEnabled ? 'Camera Off' : 'Camera On'} danger={!videoEnabled} />

        {/* Screen share */}
        <ControlBtn active={screenSharing} onClick={handleScreenShare}
          icon={screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          label={screenSharing ? 'Stop Share' : 'Share Screen'} />

        {/* Chat */}
        <ControlBtn active={chatOpen} onClick={() => setChatOpen(p => !p)}
          icon={<MessageSquare size={20} />} label="Chat" highlight />

        {/* Leave */}
        <button onClick={leaveRoom}
          className="flex flex-col items-center gap-1 group">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-red-500/20 border border-red-500/40 hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30">
            <PhoneOff size={22} className="text-red-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-xs text-white/30 group-hover:text-red-400 transition-colors">Leave</span>
        </button>
      </div>
    </div>
  );
}

// Control button component
function ControlBtn({ icon, label, onClick, active, danger, highlight }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
        danger
          ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
          : active && highlight
          ? 'bg-gold/20 border-gold/30 text-gold'
          : active
          ? 'bg-white/15 border-white/20 text-white'
          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
      }`}>
        {icon}
      </div>
      <span className={`text-xs transition-colors ${
        danger ? 'text-red-400' : active && highlight ? 'text-gold' : 'text-white/30 group-hover:text-white/60'
      }`}>
        {label}
      </span>
    </button>
  );
}
