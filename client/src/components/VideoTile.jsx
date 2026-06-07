import { useEffect, useRef } from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoTile({ stream, userName, isLocal, isMuted, isVideoOff, localVideoRef }) {
  const videoRef = useRef(null);
  const ref = isLocal ? localVideoRef : videoRef;

  useEffect(() => {
    if (ref?.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream, ref]);

  const initial = userName?.charAt(0)?.toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden bg-elevated border border-white/5 group"
      style={{ minHeight: '180px' }}>

      {/* Video */}
      {stream && !isVideoOff ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? '' : ''}`}
          style={{ transform: isLocal ? 'scaleX(-1)' : 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center min-h-[180px]"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.05), rgba(120,80,30,0.03))' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold border-2"
            style={{ background: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.3)', color: '#C9A84C' }}>
            {initial}
          </div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="text-white/80 text-sm font-medium">{userName}</span>
        {isMuted && (
          <div className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center">
            <MicOff size={11} className="text-red-400" />
          </div>
        )}
      </div>

      {/* Video off badge */}
      {isVideoOff && (
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 rounded-lg bg-black/50 border border-white/10 flex items-center gap-1">
            <VideoOff size={12} className="text-white/50" />
            <span className="text-xs text-white/50">Off</span>
          </div>
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60">You</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
