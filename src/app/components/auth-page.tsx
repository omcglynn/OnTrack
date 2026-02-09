import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { GraduationCap, Loader2, Sparkles, Map, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test123');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Welcome back!');
          onAuthSuccess();
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Account created! Please complete your profile.');
          onAuthSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden md:block text-white space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold">OnTrack</h1>
              <p className="text-lg text-blue-100">AI-Powered Degree Planning</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">4-Year Roadmap</h3>
                <p className="text-blue-100 text-sm">
                  Visualize your entire degree path from freshman to graduation with AI-optimized course sequences
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Smart Scheduling</h3>
                <p className="text-blue-100 text-sm">
                  Build weekly schedules with drag-and-drop and export to your calendar instantly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">AI Career Advisor</h3>
                <p className="text-blue-100 text-sm">
                  Get personalized course recommendations aligned with your career goals
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Built for alliz Hackathon 2026
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="p-8 bg-white/95 backdrop-blur relative overflow-hidden shadow-2xl">
          <div className="text-center mb-8">
            <div className="md:hidden mb-6">
              <GraduationCap className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h1 className="text-3xl font-bold mb-1">OnTrack</h1>
              <p className="text-gray-600">AI-Powered Degree Planning</p>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to continue your degree planning journey'
                : 'Start planning your perfect academic path'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@temple.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}