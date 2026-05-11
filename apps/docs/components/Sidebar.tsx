"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Terminal,
  Layers
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Overview",
      items: [
        { name: "Introduction", href: "/", icon: BookOpen },
        { name: "Architecture", href: "/docs/architecture", icon: Cpu },
      ]
    },
    {
      title: "API Reference",
      items: [
        { name: "HTTP API", href: "/docs/api/http", icon: Terminal },
        { name: "WebSocket API", href: "/docs/api/ws", icon: Layers },
      ]
    },
    {
      title: "Community",
      items: [
        { name: "Contributing", href: "/docs/contributing", icon: Users },
        { name: "Security", href: "/docs/security", icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside className="w-64 fixed left-auto top-[110px] bottom-10 hidden lg:block overflow-visible z-50">
      <div className="bcard corner-dots h-full p-6 flex flex-col gap-8 shadow-sm">
        <div className="wf-grid opacity-[0.03]" />
        
        {menuItems.map((section) => (
          <div key={section.title} className="relative z-10 space-y-3">
            <h5 className="px-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
              {section.title}
            </h5>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-[0_4px_12px_rgba(109,40,217,0.25)]' 
                        : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50/50'
                    }`}
                  >
                    <item.icon size={18} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
