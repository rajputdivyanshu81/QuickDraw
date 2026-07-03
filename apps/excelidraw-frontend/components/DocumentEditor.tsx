"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { Heading1, Heading2, Heading3, List, ListOrdered, Code, Terminal, Sparkles, ChevronDown, Plus, AlignLeft } from "lucide-react";

export function DocumentEditor({ roomId }: { roomId: string }) {
    const { getToken } = useAuth();
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const lastPushedContent = useRef("");
    const isLocalChange = useRef(false);

    // Initial fetch
    useEffect(() => {
        let mounted = true;
        const fetchDoc = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                
                const res = await axios.get(`${HTTP_BACKEND}/document/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (mounted) {
                    const htmlContent = res.data.document || "<div><br></div>";
                    setContent(htmlContent);
                    lastPushedContent.current = htmlContent;
                    if (editorRef.current && editorRef.current.innerHTML !== htmlContent) {
                        editorRef.current.innerHTML = htmlContent;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch document", e);
            }
        };
        fetchDoc();
        return () => { mounted = false; };
    }, [roomId, getToken]);

    // Polling
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isLocalChange.current) return;
            
            try {
                const token = await getToken();
                if (!token) return;

                const res = await axios.get(`${HTTP_BACKEND}/document/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const remoteContent = res.data.document || "<div><br></div>";
                if (remoteContent !== content && remoteContent !== lastPushedContent.current) {
                    setContent(remoteContent);
                    lastPushedContent.current = remoteContent;
                    if (editorRef.current) {
                        editorRef.current.innerHTML = remoteContent;
                    }
                }
            } catch (e) {
                console.error("Failed to poll document", e);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [roomId, getToken, content]);

    // Debounced save
    useEffect(() => {
        if (!isLocalChange.current) return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
                const token = await getToken();
                if (!token) return;

                await axios.put(`${HTTP_BACKEND}/document/${roomId}`, {
                    document: content
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                lastPushedContent.current = content;
                isLocalChange.current = false;
            } catch (e) {
                console.error("Failed to save document", e);
            } finally {
                setIsSaving(false);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timeoutId);
    }, [content, roomId, getToken]);

    const handleInput = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
            isLocalChange.current = true;
        }
    };

    const formatBlock = (tag: string) => {
        document.execCommand("formatBlock", false, tag);
        handleInput();
        setHeaderMenuOpen(false);
    };

    const formatList = (type: "ul" | "ol") => {
        document.execCommand(type === "ul" ? "insertUnorderedList" : "insertOrderedList");
        handleInput();
    };

    const formatCode = (isBlock: boolean) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (isBlock) {
            document.execCommand("formatBlock", false, "pre");
        } else {
            const code = document.createElement("code");
            code.className = "bg-[#1e1e1e] text-indigo-300 px-1.5 py-0.5 rounded font-mono text-sm border border-[#2a2a2a] mx-0.5";
            code.textContent = selectedText || "you can write your code here";
            range.deleteContents();
            range.insertNode(code);

            // Auto-select the entire contents of the code node so typing immediately replaces it
            const newRange = document.createRange();
            newRange.selectNodeContents(code);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        handleInput();
    };

    return (
        <div className="w-full h-full bg-[#121212] flex flex-col p-6 border-r border-[#2a2a2a] relative z-10">
            <div className="flex justify-between items-center mb-4 shrink-0 pl-16">
                <h2 className="text-gray-300 font-semibold text-lg flex items-center gap-2.5">
                    <div className="bg-indigo-950/60 border border-indigo-500/30 p-2 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/10 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4.5 h-4.5" />
                    </div> 
                    <span className="bg-gradient-to-r from-indigo-200 via-slate-100 to-white bg-clip-text text-transparent font-bold tracking-tight text-lg">QuickDraft</span>
                </h2>
                {isSaving && <span className="text-xs text-indigo-400 animate-pulse font-mono">Syncing...</span>}
            </div>

            {/* Editable Content Panel */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="flex-1 w-full bg-transparent text-gray-200 focus:outline-none overflow-y-auto text-base leading-relaxed placeholder-gray-500 pb-20 prose prose-invert max-w-none pl-14 
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h1]:text-white
                [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-3 [&_h2]:text-gray-200
                [&_h3]:text-xl [&_h3]:font-medium [&_h3]:my-2 [&_h3]:text-gray-300
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                [&_pre]:w-full [&_pre]:bg-[#1e1e1e] [&_pre]:text-indigo-300 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-sm [&_pre]:my-3 [&_pre]:border [&_pre]:border-[#2a2a2a] [&_pre]:block [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:leading-relaxed"
                style={{ minHeight: "200px" }}
            />

            {/* Notion-style Editor Bar */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1e1e1e]/95 backdrop-blur border border-[#2a2a2a] rounded-xl px-3 py-2 flex items-center gap-3 shadow-2xl z-20 max-w-[90%] md:max-w-max">
                
                {/* Heading Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                        className="flex items-center gap-1.5 text-gray-300 hover:text-white px-2 py-1 rounded-lg hover:bg-[#2a2a2a] transition-all text-sm font-medium shrink-0"
                    >
                        <span className="text-xs">Format</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {headerMenuOpen && (
                        <div className="absolute bottom-full mb-2 left-0 w-44 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-30 flex flex-col">
                            <button onClick={() => formatBlock("p")} className="px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors">Normal Text</button>
                            <button onClick={() => formatBlock("h1")} className="px-3 py-2 text-left text-sm font-bold text-white hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"><Heading1 className="w-4 h-4 text-indigo-400" /> Heading 1</button>
                            <button onClick={() => formatBlock("h2")} className="px-3 py-2 text-left text-sm font-semibold text-gray-200 hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"><Heading2 className="w-4 h-4 text-indigo-400" /> Heading 2</button>
                            <button onClick={() => formatBlock("h3")} className="px-3 py-2 text-left text-sm font-medium text-gray-300 hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"><Heading3 className="w-4 h-4 text-indigo-400" /> Heading 3</button>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-[#2a2a2a]" />

                {/* Lists */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => formatList("ul")} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
                        title="Bulleted List"
                    >
                        <List className="w-4.5 h-4.5" />
                    </button>
                    <button 
                        onClick={() => formatList("ol")} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4.5 h-4.5" />
                    </button>
                </div>

                <div className="w-px h-5 bg-[#2a2a2a]" />

                {/* Code Elements */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => formatCode(false)} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all flex items-center justify-center"
                        title="Inline Code (</>)"
                    >
                        <Code className="w-4.5 h-4.5" />
                    </button>
                    <button 
                        onClick={() => formatCode(true)} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all flex items-center justify-center"
                        title="Code Block"
                    >
                        <Terminal className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
