'use client';
export function AuthPage({ isSignin }: { 
  isSignin: boolean 
}) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 m-4 bg-white rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isSignin ? 'Sign In' : 'Sign Up'}
        </h2>
        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button 
            onClick={() => {}}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSignin ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}