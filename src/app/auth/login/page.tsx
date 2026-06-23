'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Tv, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = loginUser(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      router.push('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-black">OTT<span className="text-red-500">Stream</span></span>
          </Link>

          <h1 className="text-white text-3xl font-black mb-2">Welcome back</h1>
          <p className="text-white/50 mb-8">Sign in to continue watching</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 transition-colors"
                  required />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-red-500 transition-colors"
                  required />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-red-400 hover:text-red-300 font-semibold">Create one</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-950 via-zinc-950 to-black items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <Tv className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-white text-3xl font-black mb-4">Watch Anywhere</h2>
          <p className="text-white/50 text-lg leading-relaxed">
            Access live TV channels from around the world. Sports, news, entertainment — all in one place.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {['🏆 Sports', '📰 News', '🎬 Movies', '🎵 Music', '🧒 Kids', '🔭 Docs'].map((item) => (
              <div key={item} className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-white/60 text-sm">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
