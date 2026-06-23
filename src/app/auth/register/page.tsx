'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Tv, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = registerUser(email, password, name);
    if (result.success) {
      toast.success('Account created! Welcome to OTTStream!');
      router.push('/');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-2xl font-black">OTT<span className="text-red-500">Stream</span></span>
        </Link>

        <h1 className="text-white text-3xl font-black mb-2">Create account</h1>
        <p className="text-white/50 mb-8">Join OTTStream and start watching live TV</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:border-red-500 transition-colors" required />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-semibold">Sign in</Link>
        </p>

        <p className="text-center text-white/20 text-xs mt-4">
          💡 First registered account automatically becomes Admin
        </p>
      </div>
    </div>
  );
}
