'use client';
import React from 'react';
import { 
  Pencil, 
  Share2, 
  Users, 
  Shapes, 
  Cloud, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/Navigation';

function App() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shapes className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">DrawFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Templates</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Try Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Whiteboarding,{' '}
              <span className="text-indigo-600">Reimagined</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create beautiful diagrams, sketches, and presentations with our intuitive drawing tool. 
              Collaborate in real-time with your team.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => {
                router.push('/signup');
              }} className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">  
                Sign Up <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button onClick={()=> {
                router.push('/signin');
              }} className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Sign In
              </button>
            </div>
          </div>
          <div className="mt-12 relative">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80" 
                alt="DrawFlow Interface" 
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to create</h2>
            <p className="text-xl text-gray-600">Powerful features to bring your ideas to life</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Pencil className="w-6 h-6 text-indigo-600" />,
                title: "Intuitive Drawing",
                description: "Smooth, responsive drawing experience with customizable tools and shapes."
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: "Real-time Collaboration",
                description: "Work together with your team in real-time, see changes instantly."
              },
              {
                icon: <Share2 className="w-6 h-6 text-indigo-600" />,
                title: "Easy Sharing",
                description: "Share your drawings with a simple link, export in multiple formats."
              },
              {
                icon: <Cloud className="w-6 h-6 text-indigo-600" />,
                title: "Cloud Storage",
                description: "Your drawings are automatically saved and synced across devices."
              },
              {
                icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
                title: "Smart Shapes",
                description: "Perfect shapes automatically with our smart recognition system."
              },
              {
                icon: <Shapes className="w-6 h-6 text-indigo-600" />,
                title: "Templates",
                description: "Start quickly with our pre-made templates for various use cases."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start creating?
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Join thousands of teams who trust DrawFlow for their visual collaboration needs.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-semibold">
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 text-white mb-4">
                <Shapes className="w-6 h-6" />
                <span className="font-bold">DrawFlow</span>
              </div>
              <p className="text-sm">
                Making visual collaboration easy and accessible for everyone.
              </p>
            </div>
            {['Product', 'Company', 'Resources', 'Legal'].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-white mb-4">{section}</h3>
                <ul className="space-y-2 text-sm">
                  {['Features', 'Pricing', 'Support', 'Contact'].map((item, idx) => (
                    <li key={idx}>
                      <a href="#" className="hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>© 2024 DrawFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;