"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Copy, Check } from "lucide-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config"; 

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function AIHelp() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Hide on landing page (after all hooks)
    if (pathname === "/") return null;

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Include history (last 10 messages) for context
            const history = messages.slice(-10);
            const res = await axios.post(`${HTTP_BACKEND}/ai-chat`, {
                messages: [...history, userMsg]
            });
            
            const aiMsg: Message = { 
                role: "assistant", 
                content: res.data.choices[0].message.content 
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Chat Failed", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleChat}
                    className="fixed top-16 md:top-4 left-4 z-[9999] flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <Bot className="w-5 h-5" />
                    <span>AI Help</span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        drag
                        dragMomentum={false}
                        className="fixed top-20 left-4 z-[9999] w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between cursor-move handle">
                            <div className="flex items-center gap-2 text-white">
                                <Bot className="w-5 h-5" />
                                <h3 className="font-semibold">AI Assistant</h3>
                            </div>
                            <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-full transition-colors text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 mt-10">
                                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>How can I help you today?</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div 
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm relative group ${
                                            msg.role === "user" 
                                                ? "bg-indigo-600 text-white rounded-tr-none" 
                                                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        
                                        {msg.role === "assistant" && (
                                            <button 
                                                onClick={() => handleCopy(msg.content, idx)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-md bg-white border border-gray-100 shadow-sm"
                                                title="Copy response"
                                            >
                                                {copiedIndex === idx ? (
                                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask anything..." 
                                    className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-700 placeholder:text-gray-400"
                                    disabled={loading}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 disabled:grayscale transition-all shadow-sm active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
