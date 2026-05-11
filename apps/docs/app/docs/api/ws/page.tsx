import React from 'react';

export default function WebSocketApiPage() {
  return (
    <article className="prose max-w-none">
      <h1 className="gradient-text">WebSocket API</h1>
      <p>
        The WebSocket server handles real-time stroke synchronization. It is built using the <code>ws</code> 
        library and utilizes a simple JSON-based messaging protocol.
      </p>

      <h2>Connection</h2>
      <pre>
        <code>{`ws://localhost:8080?token=YOUR_CLERK_TOKEN`}</code>
      </pre>

      <h2>Client-to-Server Events</h2>
      <div className="space-y-6 my-8">
        <div className="p-6 rounded-2xl border border-gray-100 bg-white">
          <h3 className="m-0 text-purple-600 font-bold">join_room</h3>
          <p className="text-sm text-gray-500 mt-2">Subscribe to events for a specific room.</p>
          <pre className="mt-4 text-xs">
            <code>{JSON.stringify({
              type: "join_room",
              roomId: 123
            }, null, 2)}</code>
          </pre>
        </div>

        <div className="p-6 rounded-2xl border border-gray-100 bg-white">
          <h3 className="m-0 text-purple-600 font-bold">chat</h3>
          <p className="text-sm text-gray-500 mt-2">Send a new stroke or message to the room.</p>
          <pre className="mt-4 text-xs">
            <code>{JSON.stringify({
              type: "chat",
              roomId: 123,
              message: "{ strokeData: '...' }"
            }, null, 2)}</code>
          </pre>
        </div>
      </div>

      <h2>Server-to-Client Events</h2>
      <p>
        Clients will receive messages when other participants perform actions.
      </p>
      <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
        <h3 className="m-0 font-bold">New Message/Stroke</h3>
        <pre className="mt-4 text-xs">
          <code>{JSON.stringify({
            type: "chat",
            message: "{ strokeData: '...' }",
            roomId: 123
          }, null, 2)}</code>
        </pre>
      </div>
    </article>
  );
}
