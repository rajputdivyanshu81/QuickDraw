"use client";
import React, { useEffect, useRef, useState } from "react";
// Fixed ICE syntax and added robust STUN servers
import { Mic, MicOff, Phone, PhoneOff, User, Volume2, Bell, Check, X } from "lucide-react";

interface Peer {
    id: string;
    name: string;
    pc: RTCPeerConnection;
    stream?: MediaStream;
    status: RTCIceConnectionState;
}

interface VoiceChatProps {
    roomId: string;
    socket: WebSocket;
    userId: string;
    userName: string;
}

export function VoiceChat({ roomId, socket, userId, userName }: VoiceChatProps) {
    const [isInVoice, setIsInVoice] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [peers, setPeers] = useState<{ [key: string]: Peer }>({});
    const [othersInVoice, setOthersInVoice] = useState<{ id: string; name: string }[]>([]);
    const [isRequesting, setIsRequesting] = useState(false);
    const [pendingRequest, setPendingRequest] = useState<{ userId: string; name: string } | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [key: string]: Peer }>({});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeSend = (data: any) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else {
            console.warn("VoiceChat socket not open, message dropped:", data.type);
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log("VoiceChat signal received:", data.type);

            if (data.type === "voice_signal") {
                handleVoiceSignal(data);
            }

            if (data.type === "voice_ready") {
                if (isInVoice) {
                    if (data.userId !== userId) {
                        // Tie-breaker: existing people with higher ID initiate to avoid gliding
                        const isInitiator = userId > data.userId;
                        console.log(`Peer ready: ${data.name}. I am initiator? ${isInitiator}`);
                        createPeerConnection(data.userId, data.name, isInitiator);
                    }
                } else {
                    // Someone is in voice, but we aren't. Keep track of them
                    setOthersInVoice(prev => {
                        if (!prev.find(p => p.id === data.userId)) {
                            console.log("Adding to othersInVoice:", data.name, "userId:", data.userId);
                            return [...prev, { id: data.userId, name: data.name }];
                        }
                        return prev;
                    });
                }
            }

            if (data.type === "voice_left") {
                handlePeerLeft(data.userId);
            }

            if (data.type === "voice_query") {
                if (isInVoice) {
                    console.log("Responding to voice_query");
                    safeSend({
                        type: "voice_ready",
                        roomId,
                        userId,
                        name: userName
                    });
                }
            }

            if (data.type === "voice_request" && isInVoice) {
                console.log("Setting pending request from", data.name);
                setPendingRequest({ userId: data.userId, name: data.name });
            }

            if (data.type === "voice_accept" && isRequesting) {
                console.log("Voice request accepted, starting voice...");
                startVoice();
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isInVoice, userId, roomId, isRequesting]);

    useEffect(() => {
        // Query if anyone is in voice on mount ONLY
        if (socket.readyState === WebSocket.OPEN) {
            console.log("Querying for voice participants...");
            safeSend({
                type: "voice_query",
                roomId
            });
        }
    }, [roomId, socket, safeSend]); // Run only on room/socket change

    const handleJoinClick = () => {
        if (othersInVoice.length === 0) {
            startVoice();
        } else {
            setIsRequesting(true);
            safeSend({
                type: "voice_request",
                roomId,
                userId
            });
        }
    };

    const startVoice = async () => {
        try {
            console.log("Requesting microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            localStreamRef.current = stream;
            setIsInVoice(true);
            setIsRequesting(false);

            // Add tracks to any existing peer connections created while waiting for mic
            Object.values(peersRef.current).forEach(peer => {
                const pc = peer.pc;
                if (pc.getSenders().length === 0) {
                    console.log(`Late track addition to existing peer: ${peer.name}`);
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });
                }
            });

            // Notify others
            safeSend({
                type: "voice_ready",
                roomId,
                userId,
                name: userName
            });

            console.log("Voice chat started. My ID:", userId, "Tracks:", stream.getTracks().length);
        } catch (err) {
            console.error("Failed to get microphone access:", err);
            alert("Microphone access is required for voice chat.");
            setIsRequesting(false);
        }
    };

    const stopVoice = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Close all peer connections
        Object.values(peersRef.current).forEach(peer => {
            peer.pc.close();
        });
        peersRef.current = {};
        setPeers({});
        setIsInVoice(false);

        // Notify others
        safeSend({
            type: "voice_left",
            roomId,
            userId
        });
    };

    const handlePeerLeft = (peerId: string) => {
        console.log("Peer left identification:", peerId);
        const peer = peersRef.current[peerId];
        if (peer) {
            peer.pc.close();
            delete peersRef.current[peerId];
            setPeers({ ...peersRef.current });
        }
        setOthersInVoice(prev => prev.filter(p => p.id !== peerId));
    };

    const inviteToVoice = () => {
        socket.send(JSON.stringify({
            type: "group_message",
            message: "🎙️ Joins voice call! Click 'Join Voice' to connect.",
            roomId
        }));
    };

    const acceptRequest = () => {
        if (pendingRequest) {
            safeSend({
                type: "voice_accept",
                roomId,
                targetUserId: pendingRequest.userId,
                name: userName
            });
            setPendingRequest(null);
        }
    };

    const declineRequest = () => {
        setPendingRequest(null);
    };

    useEffect(() => {
        if (pendingRequest) {
            const timer = setTimeout(() => {
                setPendingRequest(null);
            }, 30000); // 30s timeout
            return () => clearTimeout(timer);
        }
    }, [pendingRequest]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const createPeerConnection = async (remoteUserId: string, remoteName: string, isInitiator: boolean) => {
        if (peersRef.current[remoteUserId]) return;

        console.log(`Creating PeerConnection for ${remoteName} (Initiator: ${isInitiator})`);
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun4.l.google.com:19302" },
                // Port 53 is often open for DNS
                { urls: "stun:stun.l.google.com:53" }, 
                // Port 19305 is an alternate STUN port
                { urls: "stun:stun.l.google.com:19305" }
            ],
            iceCandidatePoolSize: 2 // Reduced to avoid network congestion
        });

        const peer: Peer = { id: remoteUserId, name: remoteName, pc, status: 'new' };
        peersRef.current[remoteUserId] = peer;
        setPeers({ ...peersRef.current });

        // Add local stream
        if (localStreamRef.current) {
            console.log(`Adding ${localStreamRef.current.getAudioTracks().length} tracks to PC for ${remoteName}`);
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log(`Received remote track from ${remoteName}`, event.streams);
            // Fallback for browsers that don't provide streams[0]
            const stream = event.streams[0] || new MediaStream([event.track]);
            peer.stream = stream;
            setPeers({ ...peersRef.current });
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE State with ${remoteName}:`, pc.iceConnectionState);
            peer.status = pc.iceConnectionState;
            setPeers({ ...peersRef.current });
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection State with ${remoteName}:`, pc.connectionState);
        };

        pc.onicecandidateerror = (event) => {
            // Error 701 is common and often non-fatal (just one candidate failed)
            if (event.errorCode === 701) {
                console.warn(`ICE Warning (701) with ${remoteName}: STUN binding timeout (likely a blocked path, harmless if other candidates work).`);
            } else {
                console.error(`ICE Candidate Error with ${remoteName}:`, event.errorCode, event.errorText);
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                safeSend({
                    type: "voice_signal",
                    roomId,
                    targetUserId: remoteUserId,
                    signal: { type: "candidate", candidate: event.candidate },
                    senderName: userName
                });
            }
        };

        if (isInitiator) {
            try {
                console.log(`Creating offer for ${remoteName}`);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                safeSend({
                    type: "voice_signal",
                    roomId,
                    targetUserId: remoteUserId,
                    signal: offer,
                    senderName: userName
                });
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        }

        return pc;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleVoiceSignal = async (data: any) => {
        const { senderId, signal, senderName } = data;
        let peer = peersRef.current[senderId];

        if (!peer) {
            // If someone sends an offer and we don't have a peer, create one
            if (signal.type === "offer") {
                await createPeerConnection(senderId, senderName || "Remote User", false);
                peer = peersRef.current[senderId];
            } else {
                return; // Ignore candidates if we don't have a connection yet
            }
        }

        const pc = peer.pc;

        try {
            if (signal.type === "offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                safeSend({
                    type: "voice_signal",
                    roomId,
                    targetUserId: senderId,
                    signal: answer,
                    senderName: userName
                });
            } else if (signal.type === "answer") {
                console.log(`Setting remote answer from ${senderName}`);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.type === "candidate") {
                console.log(`Adding ICE candidate from ${senderName}`);
                await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        } catch (err) {
            console.error("Error handling voice signal:", err);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-[70] flex flex-col items-end gap-3 pointer-events-none">
            {/* Participant List */}
            {isInVoice && Object.values(peers).length > 0 && (
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {Object.values(peers).map(peer => (
                        <div key={peer.id} className="relative bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 relative">
                                <User className="w-4 h-4" />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${peer.stream ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-700">{peer.name}</span>
                                <div className="flex items-center gap-1">
                                    <Volume2 className={`w-3 h-3 ${peer.stream ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <span className="text-[10px] text-gray-500 italic">
                                        {peer.status === 'connected' || peer.status === 'completed' ? 'Active' : 
                                         peer.status === 'checking' ? 'Connecting...' : 
                                         peer.status === 'failed' ? 'Failed' : 'Waiting...'}
                                    </span>
                                </div>
                            </div>
                            {/* Connection Indicator Dot */}
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${
                                (peer.status === 'connected' || peer.status === 'completed') ? 'bg-green-500 animate-pulse' :
                                peer.status === 'checking' ? 'bg-yellow-400 animate-pulse' :
                                peer.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                            }`}></div>
                            {/* Hidden Remote Audio */}
                            {peer.stream && (
                                <RemoteAudio stream={peer.stream} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Main Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
                {isInVoice ? (
                    <>
                        <button
                            onClick={toggleMute}
                            className={`p-3 rounded-full shadow-xl border transition-all ${isMuted ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={stopVoice}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transition-all border border-red-700"
                            title="Leave Voice"
                        >
                            <PhoneOff className="w-5 h-5" />
                        </button>
                    </>
                ) : isRequesting ? (
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border border-indigo-100 flex items-center gap-3 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                        <span className="font-semibold text-sm text-indigo-700 text-nowrap">Asking to join...</span>
                        <button onClick={() => setIsRequesting(false)} className="text-[10px] text-gray-400 hover:text-red-500 uppercase tracking-wider font-bold">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={handleJoinClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full shadow-xl transition-all flex items-center gap-2 group border border-indigo-700 mt-28 md:mt-0"
                    >
                        <Phone className="w-5 h-5 group-hover:animate-bounce" />
                        <span className="font-semibold text-sm">Join Voice</span>
                    </button>
                )}

                {!isInVoice && (
                    <button
                        onClick={inviteToVoice}
                        className="bg-white/90 backdrop-blur-sm text-gray-600 hover:text-indigo-600 p-3 rounded-full shadow-xl border border-gray-200 transition-all active:scale-90"
                        title="Invite others to voice"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Notification if others are in voice */}
            {!isInVoice && !isRequesting && othersInVoice.length > 0 && (
                <div onClick={handleJoinClick} className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white pointer-events-auto hover:bg-indigo-700 transition-colors">
                    <div className="flex -space-x-2">
                        {othersInVoice.map((p) => (
                            <div key={p.id} className="w-6 h-6 rounded-full bg-indigo-400 border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                {p.name[0].toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-medium">Voice chat active!</span>
                </div>
            )}

            {/* Incoming Request Notification - Centered and Salient */}
            {isInVoice && pendingRequest && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-8 py-6 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-2 border-indigo-500 flex flex-col gap-5 pointer-events-auto z-[100] min-w-[320px] items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 relative">
                        <Bell className="w-8 h-8 animate-bounce" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-gray-900">{pendingRequest.name}</h3>
                        <p className="text-sm text-gray-500">Would like to join the voice call</p>
                    </div>
                    <div className="flex items-center gap-3 w-full">
                        <button 
                            onClick={acceptRequest}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Check className="w-4 h-4" />
                            Accept
                        </button>
                        <button 
                            onClick={declineRequest}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Decline
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component to handle audio element
function RemoteAudio({ stream }: { stream: MediaStream }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current && stream) {
            console.log(`Attaching stream ${stream.id} to audio element. Tracks:`, stream.getAudioTracks().length);
            audioRef.current.srcObject = stream;
            audioRef.current.onloadedmetadata = () => {
                console.log(`Audio metadata loaded for ${stream.id}, attempting play...`);
                audioRef.current?.play().catch(e => console.error("Play failed:", e));
            };
        }
    }, [stream]);

    return <audio ref={audioRef} autoPlay playsInline />;
}
