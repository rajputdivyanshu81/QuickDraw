import { useState } from "react";
import { X, Plus, Trash2, FileOutput, Loader2 } from "lucide-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

interface Slide {
    id: string;
    image: string; // base64
}

export function PPTBuilder({ 
    isOpen, 
    onClose, 
    onCaptureRequest, 
    slides, 
    onDeleteSlide 
}: { 
    isOpen: boolean; 
    onClose: () => void;
    onCaptureRequest: () => void;
    slides: Slide[];
    onDeleteSlide: (id: string) => void;
}) {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        if (slides.length === 0) return;
        setGenerating(true);
        try {
            const response = await axios.post(`${HTTP_BACKEND}/generate-ppt`, {
                slides: slides.map(s => ({ image: s.image }))
            }, {
                responseType: 'arraybuffer'
            });

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'presentation.pptx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Failed to generate PPT", e);
            alert("Failed to generate presentation");
        } finally {
            setGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="fixed md:absolute bottom-0 md:bottom-auto right-0 md:top-20 md:right-4 w-full md:w-64 h-[70vh] md:h-auto bg-white rounded-t-2xl md:rounded-lg shadow-2xl border-t md:border border-gray-200 z-[60] flex flex-col max-h-screen md:max-h-[80vh] transition-all duration-300"
        >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileOutput className="w-5 h-5 text-indigo-600" />
                    PPT Builder
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {slides.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No slides yet.</p>
                        <p className="text-xs mt-1">Click &quot;Capture&quot; to add regions.</p>
                    </div>
                ) : (
                    slides.map((slide, index) => (
                        <div key={slide.id} className="relative group bg-gray-100 rounded-md p-2 border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.image} alt={`Slide ${index + 1}`} className="w-full h-24 object-contain bg-white rounded" />
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onDeleteSlide(slide.id)}
                                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <span className="absolute bottom-1 left-2 text-xs text-gray-500 bg-white/80 px-1 rounded">
                                #{index + 1}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg space-y-2">
                <button 
                    onClick={onCaptureRequest}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Capture Area
                </button>
                <button 
                    onClick={handleGenerate}
                    disabled={slides.length === 0 || generating}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileOutput className="w-4 h-4" />
                            Generate PPT
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
