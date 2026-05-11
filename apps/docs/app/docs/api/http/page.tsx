import React from 'react';

export default function HttpApiPage() {
  const endpoints = [
    {
      method: 'POST',
      path: '/room',
      desc: 'Create a new drawing room.',
      auth: true,
      body: { name: 'string (slug)' },
      response: { roomId: 'number' }
    },
    {
      method: 'GET',
      path: '/room/:slug',
      desc: 'Retrieve room details by its unique slug.',
      auth: false,
      response: { room: 'object' }
    },
    {
      method: 'GET',
      path: '/chats/:roomId',
      desc: 'Fetch the last 1000 messages/strokes for a specific room.',
      auth: true,
      response: { messages: 'array' }
    },
    {
      method: 'POST',
      path: '/ai-chat',
      desc: 'Send a prompt to the AI Design Assistant (Groq/Llama 3.3).',
      auth: false,
      body: { messages: 'array' },
      response: { choices: 'array' }
    },
    {
      method: 'POST',
      path: '/generate-ppt',
      desc: 'Generate and download a PowerPoint presentation from canvas slides.',
      auth: false,
      body: { slides: 'array (base64 images)' },
      response: 'Binary (pptx file)'
    }
  ];

  return (
    <article className="prose max-w-none">
      <h1 className="gradient-text">HTTP API Reference</h1>
      <p>
        All HTTP requests should be sent to the backend URL defined in your environment variables. 
        Authenticated routes require a valid Clerk session token.
      </p>

      <div className="space-y-12 my-12">
        {endpoints.map((ep) => (
          <div key={ep.path} className="border border-[var(--border)] rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border)] flex items-center gap-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                ep.method === 'POST' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {ep.method}
              </span>
              <code className="text-sm font-bold text-[var(--ink)]">{ep.path}</code>
              {ep.auth && (
                <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                  Auth Required
                </span>
              )}
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm m-0">{ep.desc}</p>
              {ep.body && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Request Body</h4>
                  <pre className="m-0 p-3 text-xs"><code>{JSON.stringify(ep.body, null, 2)}</code></pre>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold uppercase text-[var(--muted)] mb-2">Response</h4>
                <pre className="m-0 p-3 text-xs"><code>{typeof ep.response === 'string' ? ep.response : JSON.stringify(ep.response, null, 2)}</code></pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
