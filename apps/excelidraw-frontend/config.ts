export const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND || "http://localhost:3001"

// Use NEXT_PUBLIC_WS_URL as the primary variable for production WebSockets
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_WS_BACKEND || "ws://localhost:8080"