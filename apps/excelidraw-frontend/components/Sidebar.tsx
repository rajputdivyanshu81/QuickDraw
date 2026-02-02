import { Palette } from "lucide-react";

export function Sidebar({ selectedBgColor, onBgColorSelect }: {
    selectedBgColor: string,
    onBgColorSelect: (color: string) => void
}) {
    const backgroundColors = [
        { name: "White", value: "#ffffff" },
        { name: "Light Gray", value: "#f3f4f6" },
        { name: "Gray", value: "#9ca3af" },
        { name: "Dark Gray", value: "#1f2937" },
        { name: "Black", value: "#000000" },
        { name: "Paper", value: "#fff1e6" },
        { name: "Grid", value: "#f0f2f5" }, // Placeholder for grid later if needed, acting as a color for now
    ];

    return (
        <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="fixed top-4 left-4 md:top-1/2 transform md:-translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-2 md:p-3 border border-gray-200 z-50 flex flex-row md:flex-col items-center gap-2 md:gap-4 max-w-[calc(100vw-80px)] overflow-x-auto no-scrollbar"
        >
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                <Palette className="w-5 h-5" />
            </div>
            <div className="hidden md:block w-full h-px bg-gray-200"></div>
            <div className="w-px h-6 bg-gray-200 md:hidden shrink-0"></div>
            <div className="flex flex-row md:flex-col items-center gap-2">
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
