import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Loader, AlertCircle, Mail } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'form'>('form');
  const [email, setEmail] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setInputEmail(emailParam);
      handleUnsubscribe(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (emailToUnsubscribe: string) => {
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      const result = await subscriptionService.unsubscribe(emailToUnsubscribe);
      
      setEmail(emailToUnsubscribe);
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      handleUnsubscribe(inputEmail.trim());
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-blue-600 animate-spin" />;
      case 'success':
        return <Check className="w-16 h-16 text-green-600" />;
      case 'error':
        return <X className="w-16 h-16 text-red-600" />;
      case 'form':
        return <Mail className="w-16 h-16 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Processing...',
          message: 'Please wait while we unsubscribe you from our mailing list.'
        };
      case 'success':
        return {
          title: 'Successfully Unsubscribed',
          message: `You have been successfully unsubscribed from Continued Education blog notifications. We're sorry to see you go!`
        };
      case 'error':
        return {
          title: 'Error',
          message: 'We encountered an error while processing your request. Please try again or contact us if the problem persists.'
        };
      case 'form':
        return {
          title: 'Unsubscribe from Newsletter',
          message: 'Enter your email address to unsubscribe from our blog notifications.'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Continued Education</h1>
          </div>

          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {statusInfo.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {statusInfo.message}
            </p>
            {email && status !== 'loading' && status !== 'form' && (
              <p className="text-sm text-gray-500 mt-3">
                Email: {email}
              </p>
            )}
          </div>

          {/* Unsubscribe Form */}
          {status === 'form' && (
            <form onSubmit={handleFormSubmit} className="mb-6">
              <div className="mb-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !inputEmail.trim()}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Unsubscribe'
                )}
              </button>
            </form>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Return to Blog
            </button>
            
            {status === 'success' && (
              <p className="text-xs text-gray-500">
                You can resubscribe anytime by visiting our blog and entering your email again.
              </p>
            )}
            
            {status === 'error' && (
              <p className="text-xs text-gray-500">
                If you continue to have issues, please contact us directly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}