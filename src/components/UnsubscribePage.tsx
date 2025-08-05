import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_unsubscribed'>('loading');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }

    handleUnsubscribe(token);
  }, [searchParams]);

  const handleUnsubscribe = async (token: string) => {
    try {
      // Find subscriber by token
      const { data: subscriber, error: findError } = await supabase
        .from('email_subscribers')
        .select('email, is_active')
        .eq('unsubscribe_token', token)
        .single();

      if (findError || !subscriber) {
        setStatus('error');
        return;
      }

      setEmail(subscriber.email);

      if (!subscriber.is_active) {
        setStatus('already_unsubscribed');
        return;
      }

      // Deactivate subscription
      const { error: updateError } = await supabase
        .from('email_subscribers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('unsubscribe_token', token);

      if (updateError) {
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-blue-600 animate-spin" />;
      case 'success':
        return <Check className="w-16 h-16 text-green-600" />;
      case 'already_unsubscribed':
        return <Check className="w-16 h-16 text-yellow-600" />;
      case 'error':
        return <X className="w-16 h-16 text-red-600" />;
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
      case 'already_unsubscribed':
        return {
          title: 'Already Unsubscribed',
          message: 'You have already been unsubscribed from our mailing list.'
        };
      case 'error':
        return {
          title: 'Error',
          message: 'We encountered an error while processing your request. The unsubscribe link may be invalid or expired.'
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
            {email && status !== 'loading' && (
              <p className="text-sm text-gray-500 mt-3">
                Email: {email}
              </p>
            )}
          </div>

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