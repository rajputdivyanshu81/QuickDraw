import { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatSidebarProps {
    roomId: string;
    socket: WebSocket;
    isOpen: boolean;
    onClose: () => void;
    userId?: string; // Optional, for identifying own messages
}

interface Message {
    id: number;
    message: string;
    userId: string;
    roomId: string;
    name?: string; // Add name property
    type: "group_message";
}

export function ChatSidebar({ roomId, socket, isOpen, onClose, userId }: ChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        console.log("ChatSidebar mounted. RoomID:", roomId, "My UserID:", userId);
    }, [roomId, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === "group_message") {
                    console.log("ChatSidebar received group_message:", data);
                    // alert("Received message: " + JSON.stringify(data)); // Uncomment for brute-force debug
                    
                    if (String(data.roomId) === String(roomId)) {
                        setMessages((prev) => [...prev, data]);
                    } else {
                        console.warn("RoomID mismatch in ChatSidebar:", { expected: roomId, received: data.roomId });
                    }
                }
            } catch (e) {
                console.error("Failed to parse chat message", e);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket, roomId]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        console.log("ChatSidebar: Sending message...", inputValue);
        const messageData = {
            type: "group_message",
            message: inputValue.trim(),
            roomId: roomId
        };

        socket.send(JSON.stringify(messageData));
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40 md:hidden"
                    />
                    
                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="fixed top-0 right-0 h-full w-full md:w-80 bg-white shadow-2xl z-[60] flex flex-col md:border-l border-gray-200"
                    >
                        {/* Header */}
                        <div className="p-3 md:p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="font-semibold text-gray-800 text-sm md:text-base">Group Chat</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No messages yet</p>
                                    <p>Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = userId ? msg.userId === userId : false;
                                    
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                            <div 
                                                className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-3 md:px-4 py-2 shadow-sm ${
                                                    isMe 
                                                        ? "bg-indigo-600 text-white rounded-br-none" 
                                                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                            </div>
                                            {!isMe && (
                                                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                                    {msg.name || "Anonymous User"}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 md:p-4 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom,16px)]">
                            <div className="flex gap-2 items-center bg-gray-50 rounded-2xl px-3 md:px-4 py-1.5 md:py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-sm transform active:scale-95 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
