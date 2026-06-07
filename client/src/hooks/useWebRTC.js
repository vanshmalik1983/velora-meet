import { useRef, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = () => {
  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // socketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> { stream, userName }
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback((targetSocketId, userName) => {
    const socket = getSocket();
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('webrtc-ice-candidate', {
          candidate,
          targetSocketId,
          fromSocketId: socket.id,
        });
      }
    };

    // Remote stream
    pc.ontrack = ({ streams }) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: { stream: streams[0], userName },
      }));
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetSocketId];
          return next;
        });
        delete peerConnections.current[targetSocketId];
      }
    };

    peerConnections.current[targetSocketId] = pc;
    return pc;
  }, []);

  const initiateCall = useCallback(async (targetSocketId, userName) => {
    const socket = getSocket();
    const pc = createPeerConnection(targetSocketId, userName);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc-offer', {
      offer,
      targetSocketId,
      fromSocketId: socket.id,
      fromUserName: socket.userName,
    });
  }, [createPeerConnection]);

  const handleOffer = useCallback(async ({ offer, fromSocketId, fromUserName }) => {
    const socket = getSocket();
    const pc = createPeerConnection(fromSocketId, fromUserName);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc-answer', { answer, targetSocketId: fromSocketId, fromSocketId: socket.id });
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async ({ answer, fromSocketId }) => {
    const pc = peerConnections.current[fromSocketId];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate, fromSocketId }) => {
    const pc = peerConnections.current[fromSocketId];
    if (pc && candidate) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      }
    }
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      // Update local preview
      const newStream = new MediaStream([screenTrack, ...localStreamRef.current.getAudioTracks()]);
      localStreamRef.current = newStream;
      setLocalStream(newStream);
      setScreenSharing(true);

      screenTrack.onended = stopScreenShare;
    } catch (err) {
      console.error('Screen share failed:', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = cameraStream.getVideoTracks()[0];

      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }

      localStreamRef.current = cameraStream;
      setLocalStream(cameraStream);
      setScreenSharing(false);
    } catch {}
  }, []);

  const cleanupPeerConnections = useCallback(() => {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams({});
  }, []);

  return {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    screenSharing,
    getLocalStream,
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanupPeerConnections,
  };
};
