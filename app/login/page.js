'use client';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LockClosedIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: formData.get('username'),
        password: formData.get('password'),
        callbackUrl: '/admin/dashboard'
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#316160] via-[#316160]/80 to-[#316160]/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#316160]/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#316160]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#316160]/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-8 relative">
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="text-center space-y-4 mb-8">
            <div className="bg-white/20 p-4 rounded-full w-20 h-20 mx-auto backdrop-blur-sm border border-white/30 transform transition-transform duration-500 hover:rotate-[360deg]">
              <LockClosedIcon className="w-12 h-12 mx-auto text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Login</h1>
            <p className="text-sm text-white/80">Sign in to your dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Username</label>
                <div className="relative group">
                  <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-hover:text-white/70 transition-colors duration-200" />
                  <input
                    name="username"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                <div className="relative group">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-hover:text-white/70 transition-colors duration-200" />
                  <input
                    name="password"
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {error && (
              <div className="p-4 text-sm text-white bg-red-500/20 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-red-500/30 animate-shake">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}