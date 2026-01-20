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
        <div className="fixed top-1/2 left-4 transform -translate-y-1/2 bg-white shadow-lg rounded-xl p-3 border border-gray-200 z-50 flex flex-col space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mb-2">
                    <Palette className="w-5 h-5" />
                </div>
                <div className="w-full h-px bg-gray-200 my-2"></div>
                {backgroundColors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onBgColorSelect(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedBgColor === color.value ? "border-indigo-600 scale-110" : "border-transparent shadow-sm"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
}
