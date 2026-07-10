"use client";
import { useState, useCallback } from 'react';
import { useAuth } from "@clerk/nextjs";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  VoiceAssistantControlBar,
  useVoiceAssistant
} from '@livekit/components-react';
import '@livekit/components-styles';
import { HTTP_BACKEND } from '@/config';

export function VoiceInterviewer({ roomId, inline = false }: { roomId: string, inline?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const { getToken } = useAuth();

  const startInterview = useCallback(async () => {
    setIsConnecting(true);
    try {
      const authToken = await getToken();
      const res = await fetch(`${HTTP_BACKEND}/api/livekit/token`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ roomName: `interview-${roomId}` })
      });
      const data = await res.json();
      setToken(data.token);
      setUrl(data.url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, getToken]);

  if (!token || !url) {
    if (inline) {
      return (
        <button
          onClick={startInterview}
          disabled={isConnecting}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isConnecting ? 'text-indigo-400 bg-[#2a2a2a]' : 'text-gray-400 hover:text-indigo-400 hover:bg-[#2a2a2a]/50'}`}
          title="Start AI Interview"
        >
          {isConnecting ? (
            <svg className="animate-spin w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          )}
        </button>
      );
    }

    return (
      <div className="absolute bottom-6 left-6 z-50">
        <button
          onClick={startInterview}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          {isConnecting ? "Connecting to AI..." : "Start HLD AI Interview"}
        </button>
      </div>
    );
  }

  if (inline) {
    return (
      <div className="relative flex items-center justify-center">
        <button
          onClick={() => setShowUI(!showUI)}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors ${showUI ? 'bg-[#2a2a2a] text-indigo-400 border border-[#3a3a3a]' : 'text-gray-400 hover:text-indigo-400 hover:bg-[#2a2a2a]/50'}`}
          title="Toggle AI Interview Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
        <div className={`fixed bottom-6 left-6 md:left-24 w-80 bg-[#1e1e1e] rounded-xl shadow-2xl p-5 border border-[#2a2a2a] z-50 ${showUI ? 'block' : 'hidden'}`}>
          <LiveKitRoom
            serverUrl={url}
            token={token}
            connect={true}
            audio={true}
            video={false}
            data-lk-theme="default"
            onDisconnected={() => {
              setToken(null);
              setShowUI(true);
            }}
          >
            <RoomAudioRenderer />
            <AgentUI onClose={() => setShowUI(false)} />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-6 z-50 w-80 bg-[#1e1e1e] rounded-xl shadow-2xl p-5 border border-gray-800">
      <LiveKitRoom
        serverUrl={url}
        token={token}
        connect={true}
        audio={true}
        video={false}
        data-lk-theme="default"
        onDisconnected={() => setToken(null)}
      >
        <RoomAudioRenderer />
        <AgentUI onClose={() => setToken(null)} />
      </LiveKitRoom>
    </div>
  );
}

function AgentUI({ onClose }: { onClose: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex justify-between w-full items-center">
        <div className="text-white font-semibold flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            AI Interviewer
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="text-sm text-gray-400 text-center">
        {state === 'connected' ? 'Listening and thinking...' : 'Connecting to AI model...'}
      </div>
      
      <style>{`
        .lk-device-menu {
          max-width: 280px !important;
          left: 0 !important;
          transform: translateY(calc(-100% - 0.5rem)) !important;
        }
        .lk-device-menu > li {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      `}</style>

      <div className="h-16 w-full flex items-center justify-center bg-[#121212] rounded-lg overflow-hidden relative">
        {audioTrack ? (
          <BarVisualizer
            state={state}
            trackRef={audioTrack}
            className="w-full h-full text-indigo-500"
            barCount={5}
            options={{ minHeight: 4 }}
          />
        ) : (
            <div className="animate-pulse flex space-x-2">
                <div className="w-1.5 h-4 bg-indigo-500/50 rounded-full"></div>
                <div className="w-1.5 h-6 bg-indigo-500/50 rounded-full"></div>
                <div className="w-1.5 h-4 bg-indigo-500/50 rounded-full"></div>
            </div>
        )}
      </div>
      <VoiceAssistantControlBar />
    </div>
  );
}
