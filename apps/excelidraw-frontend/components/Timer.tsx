"use client";
import { useState, useEffect, useRef } from "react";
import { Timer as TimerIcon, Play, Pause, RotateCcw, ChevronDown, Check, X, Bell, GripVertical } from "lucide-react";

export function Timer() {
    const [isOpen, setIsOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(300); // 5 mins default
    const [isRunning, setIsRunning] = useState(false);
    const [customMinutes, setCustomMinutes] = useState("5");
    const [isTimeUp, setIsTimeUp] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Draggable position state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    // Initialize position to top right of screen on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPosition({ x: window.innerWidth - 250, y: 80 });
        }
    }, []);

    // Audio notify setup
    const playAlarm = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            
            osc.start();
            setTimeout(() => {
                osc.stop();
                audioCtx.close();
            }, 800);
        } catch (e) {
            console.warn("Alarm audio failed to play", e);
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsTimeUp(true);
                        playAlarm();
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // Window mouse dragging listeners
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            
            const newX = Math.max(10, Math.min(window.innerWidth - 240, dragOffset.current.x + dx));
            const newY = Math.max(10, Math.min(window.innerHeight - 60, dragOffset.current.y + dy));
            
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("input") || target.closest(".timer-dropdown")) {
            return;
        }
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        dragOffset.current = { x: position.x, y: position.y };
        e.preventDefault();
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleStartPreset = (mins: number) => {
        setSecondsLeft(mins * 60);
        setIsTimeUp(false);
        setIsRunning(true);
        setIsOpen(false);
    };

    const handleApplyCustom = () => {
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0 && mins <= 120) {
            setSecondsLeft(mins * 60);
            setIsTimeUp(false);
            setIsRunning(true);
            setIsOpen(false);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsTimeUp(false);
        setSecondsLeft(parseInt(customMinutes) * 60 || 300);
    };

    // If initial position not set, don't render to avoid SSR flicker
    if (position.x === 0 && position.y === 0) return null;

    return (
        <div 
            style={{ 
                position: "fixed", 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                zIndex: 9999
            }}
            onMouseDown={handleMouseDown}
            className="flex items-center gap-1 bg-[#1e1e1e]/90 backdrop-blur border border-[#2a2a2a] rounded-xl px-2.5 py-1.5 text-xs font-semibold select-none shadow-2xl transition-all cursor-grab active:cursor-grabbing"
        >
            {/* Drag Handle Icon */}
            <GripVertical className="w-3.5 h-3.5 text-gray-500 mr-0.5 shrink-0" />

            {/* Timer Display Button */}
            <div className={`flex items-center gap-1 ${
                isTimeUp ? "text-red-400 animate-pulse" : "text-gray-300"
            }`}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                    {isTimeUp ? (
                        <Bell className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                        <TimerIcon className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span className="font-mono text-sm leading-none">{formatTime(secondsLeft)}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {/* Inline Quick Play / Pause / Reset when timer is initialized */}
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700/60">
                    {isRunning ? (
                        <button onClick={() => setIsRunning(false)} className="text-gray-400 hover:text-white p-0.5" title="Pause">
                            <Pause className="w-3 h-3" />
                        </button>
                    ) : (
                        <button onClick={() => { setIsRunning(true); setIsTimeUp(false); }} className="text-indigo-400 hover:text-indigo-300 p-0.5" title="Start">
                            <Play className="w-3 h-3" />
                        </button>
                    )}
                    <button onClick={handleReset} className="text-gray-500 hover:text-white p-0.5" title="Reset">
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Config Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-2xl p-3 flex flex-col gap-2.5 timer-dropdown animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center pb-1.5 border-b border-[#2a2a2a]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Quick Timer</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-1">
                        {[1, 3, 5, 10, 15, 25].map((mins) => (
                            <button
                                key={mins}
                                onClick={() => handleStartPreset(mins)}
                                className="bg-[#2a2a2a] hover:bg-[#323232] text-gray-300 hover:text-white font-medium py-1.5 px-2 rounded-lg text-xs transition-colors"
                            >
                                {mins} min
                            </button>
                        ))}
                    </div>

                    <div className="w-full h-px bg-[#2a2a2a] my-0.5" />

                    {/* Custom Input */}
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            placeholder="Mins"
                            className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 w-full"
                        />
                        <button
                            onClick={handleApplyCustom}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shrink-0"
                        >
                            Set
                        </button>
                    </div>
                </div>
            )}

            {/* Time is Up Banner */}
            {isTimeUp && (
                <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 z-[100] animate-bounce">
                    <Bell className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Time's Up!</span>
                    <button onClick={() => setIsTimeUp(false)} className="bg-black/20 hover:bg-black/40 rounded-full p-0.5 text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
            )}
        </div>
    );
}
