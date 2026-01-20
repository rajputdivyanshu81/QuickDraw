import {useEffect, useRef, useState} from "react";
import { initDraw } from "@/draw";
import { Toolbar, Tool } from "./Toolbar";

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

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const drawerRef = useRef<{ updateTool: (t: Tool) => void, cleanup: () => void } | null>(null);

    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0) {
            const setup = async () => {
                const drawer = await initDraw(canvasRef.current!, roomId, socket, selectedTool, token);
                if (drawer) {
                    drawerRef.current = drawer;
                    drawer.updateTool(selectedTool);
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
    
    return (
        <div className="relative">
            <Toolbar selectedTool={selectedTool} onSelect={(t) => setSelectedTool(t)} />
            <canvas 
                ref={canvasRef} 
                width={dimensions.width} 
                height={dimensions.height} 
                className="bg-white border border-gray-200 shadow-inner"
            ></canvas>
        </div>
    );
}