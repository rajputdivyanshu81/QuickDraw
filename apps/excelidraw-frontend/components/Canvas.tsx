import {useEffect, useRef, useState} from "react";
import { initDraw } from "@/draw";
import { Toolbar, Tool } from "./Toolbar";
import jsPDF from "jspdf";

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

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const drawerRef = useRef<{ updateTool: (t: Tool) => void, updateColor: (c: string) => void, cleanup: () => void } | null>(null);

    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0) {
            const setup = async () => {
                const drawer = await initDraw(canvasRef.current!, roomId, socket, selectedTool, token);
                if (drawer) {
                    drawerRef.current = drawer;
                    drawer.updateTool(selectedTool);
                    drawer.updateColor(selectedColor);
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
        if (drawerRef.current) {
            drawerRef.current.updateColor(selectedColor);
        }
    }, [selectedColor]);

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
    
    return (
        <div className="relative">
            <Toolbar 
                selectedTool={selectedTool} 
                onSelect={(t) => setSelectedTool(t)} 
                selectedColor={selectedColor}
                onColorSelect={(c) => setSelectedColor(c)}
                onDownload={handleDownload}
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