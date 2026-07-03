import {useEffect, useRef, useState, useMemo} from "react";
import { initDraw } from "@/draw";
import { Toolbar, Tool } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import jsPDF from "jspdf";

import { Undo, Redo, MessageSquare, FileText, SplitSquareHorizontal, File, PenTool, Sparkles } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { PPTBuilder } from "./PPTBuilder";
import { VoiceChat } from "./VoiceChat";
import { DocumentEditor } from "./DocumentEditor";

export function Canvas({
    roomId,
    socket,
    token
    }: {
    socket: WebSocket;
    roomId: string;
    token: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("rect");
    const [selectedColor, setSelectedColor] = useState<string>("black");
    const [zoom, setZoom] = useState<number>(1);
    const [chatOpen, setChatOpen] = useState(false);
    const myUserInfo = useMemo(() => {
        if (!token) return { userId: "anon", name: "Guest" };
        try {
            const parts = token.split('.');
            if (parts.length < 2) return { userId: "anon", name: "Guest" };
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const padding = '='.repeat((4 - base64.length % 4) % 4);
            const payload = JSON.parse(window.atob(base64 + padding));
            return {
                userId: (payload.sub || payload.userId || "anon").toString(),
                name: (payload.name || payload.first_name || "User").toString()
            };
        } catch (e) {
            console.warn("Token decode failed, using 'anon'", e);
            return { userId: "anon", name: "Guest" };
        }
    }, [token]);

    useEffect(() => {
        console.log("Canvas MyUserInfo:", myUserInfo);
    }, [myUserInfo]);

    const [viewMode, setViewMode] = useState<"canvas" | "document" | "both">("canvas");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            const navHeight = viewMode === "both" ? 56 : 0;
            if (viewMode === "canvas") {
                setDimensions({ width: window.innerWidth, height: window.innerHeight - navHeight });
            } else if (viewMode === "document") {
                setDimensions({ width: 0, height: window.innerHeight });
            } else {
                setDimensions({ width: window.innerWidth / 2, height: window.innerHeight - navHeight });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [viewMode]);

    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");

    const drawerRef = useRef<{ 
        updateTool: (t: Tool) => void, 
        updateColor: (c: string) => void, 
        updateBackgroundColor: (c: string) => void,
        resetView: () => void, 
        undo: () => void,
        redo: () => void,
        insertImage: (data: string, x: number, y: number, width: number, height: number) => void,
        cleanup: () => void,
        camera: { x: number, y: number, scale: number }
    } | null>(null);


    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.updateTool(selectedTool);
        }
    }, [selectedTool]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                drawerRef.current?.resetView();
            } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                if (e.shiftKey) {
                    drawerRef.current?.redo();
                } else {
                    drawerRef.current?.undo();
                }
                e.preventDefault();
            } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
                drawerRef.current?.redo();
                e.preventDefault();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.updateColor(selectedColor);
        }
    }, [selectedColor]);

    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.updateBackgroundColor(backgroundColor);
        }
    }, [backgroundColor]);

    const [pptOpen, setPptOpen] = useState(false);
    const [slides, setSlides] = useState<{
        id: string;
        image: string;
        elements: any[];
        pencilImage: string | null;
        width: number;
        height: number;
        bgColor: string;
    }[]>([]);

    const handleCapture = (captureData: {
        image: string; elements: any[]; pencilImage: string | null;
        width: number; height: number; bgColor: string;
    }) => {
        setSlides(prev => [...prev, { id: Math.random().toString(36), ...captureData }]);
        // Optional: switch back to select tool or keep capturing?
        // drawerRef.current?.updateTool("select");
        // For smoother UX, let's keep capturing but maybe show a toast?
    };

    const handleDeleteSlide = (id: string) => {
        setSlides(prev => prev.filter(s => s.id !== id));
    };

    const handleDownload = (format: "png" | "pdf") => {
        console.log("Canvas handleDownload triggered with format:", format);
        if (!canvasRef.current) {
            console.error("Canvas ref is missing");
            return;
        }
        
        try {
            if (format === "png") {
                console.log("Generating PNG...");
                const link = document.createElement("a");
                link.download = `drawflow-export-${Date.now()}.png`;
                link.href = canvasRef.current.toDataURL("image/png");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log("PNG download triggered successfully");
            } else {
                console.log("Generating PDF...");
                const pdf = new jsPDF("l", "px", [dimensions.width, dimensions.height]);
                const imgData = canvasRef.current.toDataURL("image/png");
                pdf.addImage(imgData, "PNG", 0, 0, dimensions.width, dimensions.height);
                pdf.save(`drawflow-export-${Date.now()}.pdf`);
                console.log("PDF download triggered successfully");
            }
        } catch (error) {
            console.error("Download failed inside handleDownload:", error);
        }
    };

    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0 && token) {
            const setup = async () => {
                const drawer = await initDraw(
                    canvasRef.current!, 
                    roomId, 
                    socket, 
                    selectedTool, 
                    token, 
                    (scale) => setZoom(scale),
                    backgroundColor,
                    handleCapture // Pass capture callback
                );
                if (drawer) {
                    drawerRef.current = drawer;
                    drawer.updateTool(selectedTool);
                    drawer.updateColor(selectedColor);
                    drawer.updateBackgroundColor(backgroundColor);
                }
            };
            setup();
            
            return () => {
                if (drawerRef.current) {
                    drawerRef.current.cleanup();
                    drawerRef.current = null;
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef, roomId, socket, dimensions, token]); 

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                if (!drawerRef.current || !drawerRef.current.camera) {
                    console.error("Camera state not available");
                    return;
                }
                
                const { x: camX, y: camY, scale } = drawerRef.current.camera;
                
                // Calculate world coordinates for the center of the screen
                const centerX = (window.innerWidth / 2 - camX) / scale;
                const centerY = (window.innerHeight / 2 - camY) / scale;
                
                // Scale image if too large
                let width = img.width;
                let height = img.height;
                const maxDim = 500 / scale; // Adjust max size based on zoom
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width *= ratio;
                    height *= ratio;
                }

                drawerRef.current.insertImage(dataUrl, centerX - width/2, centerY - height/2, width, height);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-[#121212]">
            {/* View Mode Toggle (Top Left - where AI Help was before) */}
            <div className="absolute top-[22px] left-6 z-[60] flex bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-1 shadow-lg">
                <button 
                    onClick={() => setViewMode("document")}
                    className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === "document" ? "bg-[#2a2a2a] text-indigo-400" : "text-gray-400 hover:text-gray-200"}`}
                    title="Document Only"
                >
                    <File className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode("both")}
                    className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === "both" ? "bg-[#2a2a2a] text-indigo-400" : "text-gray-400 hover:text-gray-200"}`}
                    title="Split View"
                >
                    <SplitSquareHorizontal className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode("canvas")}
                    className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === "canvas" ? "bg-[#2a2a2a] text-indigo-400" : "text-gray-400 hover:text-gray-200"}`}
                    title="Canvas Only"
                >
                    <PenTool className="w-5 h-5" />
                </button>
            </div>

            {/* Document Panel */}
            {viewMode !== "canvas" && (
                <div className={`${viewMode === "both" ? "w-1/2" : "w-full"} h-full`}>
                    <DocumentEditor roomId={roomId} />
                </div>
            )}

            {/* Canvas Panel */}
            {viewMode !== "document" && (
                <div className={`relative h-full ${viewMode === "both" ? "w-1/2" : "w-full"} flex flex-col`}>
                    
                    {/* Whiteboard Header Navbar (only in split screen) */}
                    {viewMode === "both" && (
                        <div className="w-full h-14 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center justify-between px-4 z-[45] shrink-0">
                            {/* Left Side: Background Color Picker & Undo/Redo */}
                            <div className="flex items-center gap-3">
                                <Sidebar 
                                    selectedBgColor={backgroundColor} 
                                    onBgColorSelect={setBackgroundColor} 
                                    inline={true}
                                />
                                <div className="w-px h-5 bg-[#2a2a2a]" />
                                <div className="flex bg-[#2a2a2a]/60 border border-[#2a2a2a] rounded-lg p-0.5">
                                    <button 
                                        onClick={() => drawerRef.current?.undo()} 
                                        className="p-1.5 hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded transition-colors" 
                                        title="Undo (Ctrl+Z)"
                                    >
                                        <Undo className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-4 bg-[#2a2a2a] my-auto" />
                                    <button 
                                        onClick={() => drawerRef.current?.redo()} 
                                        className="p-1.5 hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded transition-colors" 
                                        title="Redo (Ctrl+Y)"
                                    >
                                        <Redo className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: AI Assistant, PPT, Chat */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95 shrink-0"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI Assistant</span>
                                </button>
                                <button 
                                    onClick={() => setPptOpen(!pptOpen)} 
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                                        pptOpen 
                                            ? 'bg-indigo-600 border-indigo-700 text-white' 
                                            : 'bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>PPT</span>
                                </button>
                                <button 
                                    onClick={() => setChatOpen(true)} 
                                    className="flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#323232] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#3a3a3a] transition-all shrink-0"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Controls for Canvas Only mode */}
                    {viewMode === "canvas" && (
                        <>
                            {/* Top Right Floating Chat & PPT */}
                            <div className="absolute top-4 right-4 z-[60] flex items-center gap-2">
                                <button
                                    onClick={() => setPptOpen(!pptOpen)}
                                    className={`flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-xl md:rounded-lg shadow-lg transition-colors shrink-0 ${pptOpen ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                                >
                                    <FileText className="w-5 h-5 md:hidden" />
                                    <span className="font-medium hidden md:inline text-sm">PPT</span>
                                </button>
                                <button
                                    onClick={() => setChatOpen(true)}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-4 md:py-2 rounded-xl md:rounded-lg shadow-lg transition-colors shrink-0"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="hidden md:inline font-medium text-sm">Chat</span>
                                </button>
                            </div>

                            {/* Floating Sidebar (Palette) */}
                            <Sidebar 
                                selectedBgColor={backgroundColor} 
                                onBgColorSelect={setBackgroundColor} 
                                inline={false}
                            />

                            {/* Floating Undo/Redo */}
                            <div className="absolute bottom-24 md:bottom-8 left-4 z-50 flex flex-col gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl shadow-xl border border-gray-200">
                                <button 
                                    onClick={() => drawerRef.current?.undo()}
                                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                                    title="Undo (Ctrl+Z)"
                                >
                                    <Undo className="w-5 h-5" />
                                </button>
                                <div className="h-px bg-gray-100 mx-1" />
                                <button 
                                    onClick={() => drawerRef.current?.redo()}
                                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                                    title="Redo (Ctrl+Y)"
                                >
                                    <Redo className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}

                    <Toolbar 
                        selectedTool={selectedTool} 
                        onSelect={(t) => setSelectedTool(t)} 
                        selectedColor={selectedColor}
                        onColorSelect={(c) => setSelectedColor(c)}
                        onDownload={handleDownload}
                        onImageUpload={handleImageUpload}
                        onResetView={() => drawerRef.current?.resetView()}
                        zoom={zoom}
                        vertical={viewMode === "both"}
                    />

                    <PPTBuilder 
                        isOpen={pptOpen} 
                        onClose={() => setPptOpen(false)}
                        onCaptureRequest={() => setSelectedTool("ppt-capture")}
                        slides={slides}
                        onDeleteSlide={handleDeleteSlide}
                    />

                    <ChatSidebar 
                        isOpen={chatOpen} 
                        onClose={() => setChatOpen(false)} 
                        roomId={roomId} 
                        socket={socket}
                        userId={myUserInfo.userId}
                    />

                    <VoiceChat 
                        roomId={roomId} 
                        socket={socket} 
                        userId={myUserInfo.userId}
                        userName={myUserInfo.name}
                    />

                    <canvas 
                        ref={canvasRef} 
                        width={dimensions.width} 
                        height={dimensions.height} 
                        className={`border-l border-gray-200 shadow-inner ${selectedTool === "ppt-capture" ? "cursor-crosshair" : ""}`}
                    ></canvas>
                </div>
            )}
        </div>
    );
}