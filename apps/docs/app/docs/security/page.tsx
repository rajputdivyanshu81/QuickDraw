import React from 'react';
import { Shield, Lock, EyeOff, Key } from 'lucide-react';

export default function SecurityPage() {
  const principles = [
    {
      title: "Data Isolation",
      desc: "Rooms are isolated by unique slugs and IDs. Access is restricted to participants who possess the room link.",
      icon: Shield
    },
    {
      title: "Secure Authentication",
      desc: "We use Clerk for identity management, ensuring state-of-the-art protection for user accounts and session tokens.",
      icon: Key
    },
    {
      title: "Privacy First",
      desc: "Brush strokes are only shared with participants in your room. We do not use your data for training third-party models.",
      icon: EyeOff
    },
    {
      title: "Encrypted Transport",
      desc: "All data sent between the client and server (both HTTP and WebSocket) is encrypted via TLS/SSL.",
      icon: Lock
    }
  ];

  return (
    <article className="prose max-w-none">
      <h1 className="gradient-text">Security & Privacy</h1>
      <p>
        At QuickDraw, the security and privacy of your collaborative work are our top priorities. 
        We&apos;ve implemented multi-layered security measures to ensure your data stays yours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12 not-prose">
        {principles.map((item) => (
          <div key={item.title} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-600 mb-4 border border-purple-50">
              <item.icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed m-0">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Reporting Vulnerabilities</h2>
      <p>
        If you discover a security vulnerability, please do not open a public issue. Instead, 
        follow the process outlined in our <strong>SECURITY.md</strong> file in the root of the repository.
      </p>
      
      <div className="bg-purple-900 text-white p-8 rounded-3xl my-10 not-prose">
        <h3 className="text-xl font-bold mb-4">Security Baseline</h3>
        <ul className="space-y-4 m-0 p-0 list-none">
          <li className="flex items-center gap-3 text-purple-200">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Regular dependency updates via Dependabot</span>
          </li>
          <li className="flex items-center gap-3 text-purple-200">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Automated CI security scanning (GitHub Actions)</span>
          </li>
          <li className="flex items-center gap-3 text-purple-200">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>No long-term storage of sensitive user metadata</span>
          </li>
        </ul>
      </div>
    </article>
  );
}
