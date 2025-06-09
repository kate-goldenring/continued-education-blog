import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login({ email, password });
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in to manage your blog</p>
          </div>

          {/* Supabase Setup Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Supabase Authentication:</h3>
            <p className="text-sm text-blue-700">
              This app uses Supabase for authentication. Make sure to set up your Supabase project and add the environment variables to your .env file.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Back to Blog Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}