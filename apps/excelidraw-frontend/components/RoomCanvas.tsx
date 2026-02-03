"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const wsRef: { current: WebSocket | null } = { current: null };

        const initWs = async () => {
            try {
                const authToken = await getToken();
                if (!authToken) {
                    console.error("No auth token received from Clerk");
                    setError("Authentication failed: No token received.");
                    return;
                }
                console.log("Auth token received, length:", authToken.length);
                setToken(authToken);

                const ws = new WebSocket(`${WS_URL}?token=${authToken}`);
                wsRef.current = ws;
                
                ws.onopen = () => {
                    console.log("WebSocket connection opened for room:", roomId);
                    setSocket(ws);
                    ws.send(JSON.stringify({
                        type: "join_room",
                        roomId
                    }));
                };

                ws.onerror = (_e) => {
                    console.error("WebSocket error:", _e);
                    setError("Failed to connect to the drawing server. Please try again.");
                };
                
                ws.onclose = () => {
                    console.log("Disconnected from server");
                };

            } catch {
                setError("Authentication failed.");
            }
        };

        initWs();

        return () => {
            if (wsRef.current) {
                console.log("Closing WebSocket for room:", roomId);
                wsRef.current.close();
            }
        };
    }, [roomId, isLoaded, isSignedIn, getToken]);

    if (error) {
        return <div className="flex justify-center items-center h-screen bg-white text-red-500 font-semibold">{error}</div>;
    }

    if (!socket || !token) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-lg">Connecting to drawing server...</p>
            </div>
        );
    }
    return (
        <div className="h-screen w-screen overflow-hidden">
            <Canvas roomId={roomId} socket={socket} token={token} />
        </div>
    );
}