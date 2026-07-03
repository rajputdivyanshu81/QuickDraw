"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export function DocumentEditor({ roomId, token }: { roomId: string, token: string }) {
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const lastPushedContent = useRef("");
    const isLocalChange = useRef(false);

    // Initial fetch
    useEffect(() => {
        let mounted = true;
        const fetchDoc = async () => {
            try {
                const res = await axios.get(`${HTTP_BACKEND}/document/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (mounted) {
                    setContent(res.data.document || "");
                    lastPushedContent.current = res.data.document || "";
                }
            } catch (e) {
                console.error("Failed to fetch document", e);
            }
        };
        fetchDoc();
        return () => { mounted = false; };
    }, [roomId, token]);

    // Polling
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isLocalChange.current) return;
            
            try {
                const res = await axios.get(`${HTTP_BACKEND}/document/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Only update if it actually changed and isn't what we just pushed
                if (res.data.document !== content && res.data.document !== lastPushedContent.current) {
                    setContent(res.data.document || "");
                    lastPushedContent.current = res.data.document || "";
                }
            } catch (e) {
                console.error("Failed to poll document", e);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [roomId, token, content]);

    // Debounced save
    useEffect(() => {
        if (!isLocalChange.current) return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
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
    }, [content, roomId, token]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        isLocalChange.current = true;
    };

    return (
        <div className="w-full h-full bg-[#121212] flex flex-col p-6 border-r border-[#2a2a2a] relative z-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-300 font-semibold text-lg flex items-center gap-2">
                    <span className="bg-[#2a2a2a] p-1.5 rounded-md text-indigo-400">📝</span> 
                    Untitled File
                </h2>
                {isSaving && <span className="text-xs text-indigo-400 animate-pulse">Saving...</span>}
            </div>
            <textarea
                value={content}
                onChange={handleChange}
                placeholder="Type your notes or document here..."
                className="flex-1 w-full bg-transparent text-gray-200 border-none resize-none focus:outline-none focus:ring-0 text-base leading-relaxed placeholder-gray-500"
            />
        </div>
    );
}
