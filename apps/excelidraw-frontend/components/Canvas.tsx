import {useEffect, useRef, useState} from "react";
import { initDraw } from "@/draw";
import { Toolbar, Tool } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import jsPDF from "jspdf";

import { Undo, Redo, MessageSquare } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";

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

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");

    const drawerRef = useRef<{ 
        updateTool: (t: Tool) => void, 
        updateColor: (c: string) => void, 
        updateBackgroundColor: (c: string) => void,
        resetView: () => void, 
        undo: () => void,
        redo: () => void,
        cleanup: () => void 
    } | null>(null);

    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0) {
            const setup = async () => {
            const drawer = await initDraw(
                canvasRef.current!, 
                roomId, 
                socket, 
                selectedTool, 
                token, 
                (scale) => setZoom(scale),
                backgroundColor
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
    }, [canvasRef, roomId, socket, dimensions]);

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

    const [chatOpen, setChatOpen] = useState(false);

    // ... (rest of useEffects) 

    const handleDownload = (format: "png" | "pdf") => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (format === "png") {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `quickdraw-${roomId}.png`;
            link.click();
        } else if (format === "pdf") {
            const dataUrl = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(dataUrl, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`quickdraw-${roomId}.pdf`);
        }
    };
    
    const myUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : undefined;
    console.log("Canvas: My UserID from token:", myUserId);

    return (
        <div className="relative">
            <Toolbar 
                selectedTool={selectedTool} 
                onSelect={(t) => setSelectedTool(t)} 
                selectedColor={selectedColor}
                onColorSelect={(c) => setSelectedColor(c)}
                onDownload={handleDownload}
                onResetView={() => drawerRef.current?.resetView()}
                zoom={zoom}
            />
            <Sidebar 
                selectedBgColor={backgroundColor} 
                onBgColorSelect={setBackgroundColor} 
            />
            
            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                {/* Undo/Redo Group */}
                <div className="flex gap-1 bg-white p-1.5 rounded-lg shadow-md border border-gray-200">
                    <button 
                        onClick={() => drawerRef.current?.undo()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => drawerRef.current?.redo()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Toggle */}
                <button
                    onClick={() => setChatOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="hidden md:inline font-medium">Chat</span>
                </button>
            </div>

            <ChatSidebar 
                isOpen={chatOpen} 
                onClose={() => setChatOpen(false)} 
                roomId={roomId} 
                socket={socket}
                userId={myUserId}
            />

            <canvas 
                ref={canvasRef} 
                width={dimensions.width} 
                height={dimensions.height} 
                className="bg-white border border-gray-200 shadow-inner"
            ></canvas>
        </div>
    );
}