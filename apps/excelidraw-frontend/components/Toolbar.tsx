import { Pencil, Square, Circle, Eraser, Type, MousePointer2, Share2, Check, Download, Image as ImageIcon, FileText, Minus, Hand } from "lucide-react";
import { useState } from "react";

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select" | "line" | "pan" | "ppt-capture";

export function Toolbar({ selectedTool, onSelect, selectedColor, onColorSelect, onDownload, onImageUpload, onResetView, zoom }: { 
    selectedTool: Tool, 
    onSelect: (tool: Tool) => void,
    selectedColor: string,
    onColorSelect: (color: string) => void;
    onDownload: (format: "png" | "pdf") => void;
    onImageUpload: (file: File) => void;
    onResetView: () => void;
    zoom: number;
}) {
    const [downloadOpen, setDownloadOpen] = useState(false);
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
        <div onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} className={`fixed bottom-6 md:bottom-auto md:top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl md:rounded-full px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-1.5 md:gap-4 border border-gray-200 z-50 w-[95vw] md:w-auto max-w-full no-scrollbar ${downloadOpen ? 'overflow-visible' : 'overflow-x-auto'}`}>
            <div className="flex items-center gap-1 md:gap-2 border-r border-gray-200 pr-1.5 md:pr-2 shrink-0">
                <button 
                    onClick={() => onSelect("select")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "select" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Select (V)"
                >
                    <MousePointer2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("pan")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "pan" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Pan Tool (Space)"
                >
                    <Hand className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("pencil")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "pencil" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Pencil (P)"
                >
                    <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("line")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "line" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Line (L)"
                >
                    <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("rect")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "rect" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Rectangle (R)"
                >
                    <Square className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("circle")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "circle" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Circle (C)"
                >
                    <Circle className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("text")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "text" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Text (T)"
                >
                    <Type className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => onSelect("eraser")}
                    className={`p-1.5 md:p-2 rounded-xl md:rounded-full hover:bg-gray-100 transition-colors ${selectedTool === "eraser" ? "bg-indigo-100 text-indigo-600" : "text-gray-600"}`}
                    title="Eraser (E)"
                >
                    <Eraser className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>

            <div className="flex items-center gap-1 md:gap-2 border-r border-gray-200 pr-1.5 md:pr-2 shrink-0">
                {[
                    { name: "Black", value: "black" },
                    { name: "Red", value: "#ef4444" },
                    { name: "Blue", value: "#3b82f6" },
                    { name: "Green", value: "#22c55e" },
                    { name: "Indigo", value: "#6366f1" }
                ].map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onColorSelect(color.value)}
                        className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color.value ? "border-gray-400 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <div className="hidden lg:flex items-center space-x-2 px-2 md:px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-[10px] md:text-xs font-mono border border-gray-100">
                    <span>{Math.round(zoom * 100)}%</span>
                </div>

                <button 
                    onClick={onResetView}
                    className="flex items-center justify-center p-1.5 md:px-3 md:py-1.5 rounded-xl md:rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs md:text-sm font-medium transition-colors shadow-sm"
                    title="Reset View (Esc)"
                >
                    <span className="hidden lg:inline">Reset View</span>
                    <Hand className="w-4 h-4" />
                </button>

                <button 
                    onClick={shareCanvas}
                    className="flex items-center justify-center p-1.5 md:px-3 md:py-1.5 rounded-xl md:rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-medium transition-colors shadow-sm"
                >
                    {copied ? (
                        <Check className="w-4 h-4 md:mr-1" />
                    ) : (
                        <Share2 className="w-4 h-4 md:mr-1" />
                    )}
                    <span className="hidden lg:inline">{copied ? "Copied!" : "Share"}</span>
                </button>

                <button 
                    onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) onImageUpload(file);
                        };
                        input.click();
                    }}
                    className="flex items-center justify-center p-1.5 md:px-3 md:py-1.5 rounded-xl md:rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs md:text-sm font-medium transition-colors shadow-sm"
                    title="Upload Image"
                >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">Image</span>
                </button>

                <div className="relative shrink-0">
                    <button 
                        onClick={() => setDownloadOpen(!downloadOpen)}
                        className="flex items-center justify-center p-1.5 md:px-3 md:py-1.5 rounded-xl md:rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs md:text-sm font-medium transition-colors shadow-sm"
                        title="Export Canvas"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden lg:inline ml-1">Download</span>
                    </button>

                    {downloadOpen && (
                        <div className="absolute right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] py-1 animate-in fade-in zoom-in duration-200 origin-bottom-right md:origin-top-right">
                            <button 
                                onClick={() => { console.log("Toolbar selecting PNG"); onDownload("png"); setDownloadOpen(false); }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span>Export as PNG</span>
                            </button>
                            <button 
                                onClick={() => { console.log("Toolbar selecting PDF"); onDownload("pdf"); setDownloadOpen(false); }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Export as PDF</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
