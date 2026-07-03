import { useState } from "react";
import { Palette } from "lucide-react";

export function Sidebar({ selectedBgColor, onBgColorSelect }: {
    selectedBgColor: string,
    onBgColorSelect: (color: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);

    const backgroundColors = [
        { name: "White", value: "#ffffff" },
        { name: "Light Gray", value: "#f3f4f6" },
        { name: "Gray", value: "#9ca3af" },
        { name: "Dark Gray", value: "#1f2937" },
        { name: "Black", value: "#000000" },
        { name: "Paper", value: "#fff1e6" },
        { name: "Grid", value: "#f0f2f5" },
    ];

    return (
        <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="fixed bottom-24 md:bottom-8 left-52 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-2 border border-gray-200 z-50 flex flex-row items-center gap-2 transition-all duration-300 ease-in-out"
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 shrink-0 transition-colors"
                title="Canvas Background"
            >
                <Palette className="w-5 h-5" />
            </button>
            
            <div className={`flex flex-row items-center gap-2 transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen 
                    ? "opacity-100 max-w-[300px] max-h-[300px] scale-100" 
                    : "opacity-0 max-w-0 max-h-0 scale-95 pointer-events-none"
            }`}>
                <div className="w-px h-6 bg-gray-200 shrink-0 mx-1"></div>
                
                {backgroundColors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onBgColorSelect(color.value)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-transform hover:scale-110 shrink-0 ${selectedBgColor === color.value ? "border-indigo-600 scale-110" : "border-transparent shadow-sm"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
}
