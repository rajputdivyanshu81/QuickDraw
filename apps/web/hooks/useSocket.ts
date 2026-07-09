import { useEffect, useState } from "react";
import { WS_URL } from "./../app/room/[slug]/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_WS_TOKEN;
        if (!token) {
            setLoading(false);
            return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        };

        ws.onclose = () => {
            setSocket(undefined);
        };

        return () => ws.close();
    }, []);

    return {
        socket,
        loading
    };
}
