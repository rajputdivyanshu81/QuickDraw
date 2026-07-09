import { useEffect, useState } from "react";
import { WS_URL } from "./../app/room/[slug]/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYzEyNzllMy1kMjFjLTQzODctYWRmZC02NmQwNTAwYzQ3MjciLCJpYXQiOjE3Mzg4NTYzNzJ9.l2G8FoPSzKK0HtOaWcjy8Uz0yc8tO-e--fRHfWYjB5c`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

    

}