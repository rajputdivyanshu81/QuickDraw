import { Pencil, Square, Circle, Eraser, Type, MousePointer2, Share2, Check } from "lucide-react";
import { useState } from "react";

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select";

export function Toolbar({ selectedTool, onSelect }: { 
    selectedTool: Tool, 
    onSelect: (tool: Tool) => void 
}) {
    const [copied, setCopied] = useState(false);

    const shareCanvas = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL: ", err);
        }
    };

    return (
        <div onMouseDown={(e) => e.stopPropagation()} className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-4 border border-gray-200 z-50">
            <div className="flex space-x-2 border-r border-gray-200 pr-2">
                <button 
                    onClick={() => onSelect("select")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "select" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Select (V)"
                >
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onSelect("pencil")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "pencil" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Pencil (P)"
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onSelect("rect")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "rect" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Rectangle (R)"
                >
                    <Square className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onSelect("circle")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "circle" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Circle (C)"
                >
                    <Circle className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onSelect("text")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "text" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Text (T)"
                >
                    <Type className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onSelect("eraser")}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "eraser" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Eraser (E)"
                >
                    <Eraser className="w-5 h-5" />
                </button>
            </div>
            
            <button 
                onClick={shareCanvas}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                    </>
                ) : (
                    <>
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </>
                )}
            </button>
        </div>
    );
}
