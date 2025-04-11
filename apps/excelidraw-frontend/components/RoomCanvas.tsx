"use client";
import { useEffect } from "react";
import { useState } from "react";
import { Canvas } from "./Canvas";
import {WS_URL} from "@/config";
export function RoomCanvas({ roomId }: { roomId: string }) {
  
    const [socket, setSocket] = useState<WebSocket | null>(null);


        useEffect(() => {
            const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTVkN2M3Mi0wODU2LTRhZDMtYWYyNi05ZWQ3NWIyNjYzOGQiLCJpYXQiOjE3NDQzNjI5MjF9.b9zya1M68y1VEVg_uDokFBVUrRykmCykw1cUlMbLclw`);
            ws.onopen = () => {
                setSocket(ws);
            };
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }));
        };
    }, []);

    if (!socket) {
        return <div>connecting to server ...</div>;
    }
    return 
        <div>
           
          <Canvas roomId={roomId} socket={socket}/>
            </div>
}