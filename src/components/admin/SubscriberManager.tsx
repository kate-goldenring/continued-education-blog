import React, { useState, useEffect } from 'react';
import { Mail, Download, RefreshCw, Users, UserCheck, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { emailService, ResendContact } from '../../services/emailService';

interface SubscriberStats {
  totalSubscribers: number;
  activeSubscribers: number;
}

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState<ResendContact[]>([]);
  const [stats, setStats] = useState<SubscriberStats>({ totalSubscribers: 0, activeSubscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<ResendContact | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
    loadStats();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const subscriberList = await subscriptionService.getAllSubscribers();
      setSubscribers(subscriberList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await subscriptionService.getSubscriptionStats();
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleExportSubscribers = async () => {
    try {
      setActionLoading('export');
      const csvContent = await subscriptionService.exportSubscribers();
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export subscribers');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsubscribeUser = async (contactId: string, email: string) => {
    try {
      setActionLoading(contactId);
      const result = await emailService.updateContactSubscription(contactId, true);
      
      if (result.success) {
        // Update local state
        setSubscribers(prev => prev.map(sub => 
          sub.id === contactId ? { ...sub, unsubscribed: true } : sub
        ));
        loadStats(); // Refresh stats
      } else {
        setError(result.error || 'Failed to unsubscribe user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubscribeUser = async (contactId: string, email: string) => {
    try {
      setActionLoading(contactId);
      const result = await emailService.updateContactSubscription(contactId, false);
      
      if (result.success) {
        // Update local state
        setSubscribers(prev => prev.map(sub => 
          sub.id === contactId ? { ...sub, unsubscribed: false } : sub
        ));
        loadStats(); // Refresh stats
      } else {
        setError(result.error || 'Failed to resubscribe user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resubscribe user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContact = async (contactId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${email} from your contacts? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(contactId);
      const result = await emailService.removeContact(contactId);
      
      if (result.success) {
        // Update local state
        setSubscribers(prev => prev.filter(sub => sub.id !== contactId));
        loadStats(); // Refresh stats
      } else {
        setError(result.error || 'Failed to remove contact');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove contact');
    } finally {
      setActionLoading(null);
    }
  };

  const activeSubscribers = subscribers.filter(sub => !sub.unsubscribed);
  const unsubscribedUsers = subscribers.filter(sub => sub.unsubscribed);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading subscribers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Email Subscribers</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadSubscribers}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportSubscribers}
              disabled={actionLoading === 'export' || subscribers.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {actionLoading === 'export' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-1 text-red-600 hover:text-red-800 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalSubscribers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Active Subscribers</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeSubscribers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers - stats.activeSubscribers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="p-6">
        {subscribers.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No subscribers yet</p>
            <p className="text-gray-400">Subscribers will appear here when people sign up for your newsletter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Subscribers */}
            {activeSubscribers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                  Active Subscribers ({activeSubscribers.length})
                </h3>
                <div className="space-y-2">
                  {activeSubscribers.map((subscriber) => (
                    <SubscriberRow
                      key={subscriber.id}
                      subscriber={subscriber}
                      onView={setSelectedSubscriber}
                      onUnsubscribe={handleUnsubscribeUser}
                      onResubscribe={handleResubscribeUser}
                      onRemove={handleRemoveContact}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unsubscribed Users */}
            {unsubscribedUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 text-gray-600 mr-2" />
                  Unsubscribed ({unsubscribedUsers.length})
                </h3>
                <div className="space-y-2">
                  {unsubscribedUsers.map((subscriber) => (
                    <SubscriberRow
                      key={subscriber.id}
                      subscriber={subscriber}
                      onView={setSelectedSubscriber}
                      onUnsubscribe={handleUnsubscribeUser}
                      onResubscribe={handleResubscribeUser}
                      onRemove={handleRemoveContact}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscriber Detail Modal */}
      {selectedSubscriber && (
        <SubscriberDetailModal
          subscriber={selectedSubscriber}
          onClose={() => setSelectedSubscriber(null)}
        />
      )}
    </div>
  );
}

// Subscriber Row Component
interface SubscriberRowProps {
  subscriber: ResendContact;
  onView: (subscriber: ResendContact) => void;
  onUnsubscribe: (contactId: string, email: string) => void;
  onResubscribe: (contactId: string, email: string) => void;
  onRemove: (contactId: string, email: string) => void;
  actionLoading: string | null;
}

function SubscriberRow({ 
  subscriber, 
  onView, 
  onUnsubscribe, 
  onResubscribe, 
  onRemove, 
  actionLoading 
}: SubscriberRowProps) {
  const isLoading = actionLoading === subscriber.id;
  const displayName = subscriber.firstName && subscriber.lastName 
    ? `${subscriber.firstName} ${subscriber.lastName}`
    : subscriber.firstName || subscriber.lastName || 'No name provided';

  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
      subscriber.unsubscribed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          subscriber.unsubscribed ? 'bg-gray-100' : 'bg-blue-100'
        }`}>
          <Mail className={`w-5 h-5 ${
            subscriber.unsubscribed ? 'text-gray-500' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{subscriber.email}</p>
          <p className="text-sm text-gray-500">{displayName}</p>
          <p className="text-xs text-gray-400">
            Subscribed: {new Date(subscriber.createdAt).toLocaleDateString()}
            {subscriber.unsubscribed && (
              <span className="ml-2 text-red-500">• Unsubscribed</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(subscriber)}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {subscriber.unsubscribed ? (
          <button
            onClick={() => onResubscribe(subscriber.id, subscriber.email)}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50 transition-colors duration-200"
            title="Resubscribe user"
          >
            {isLoading ? 'Loading...' : 'Resubscribe'}
          </button>
        ) : (
          <button
            onClick={() => onUnsubscribe(subscriber.id, subscriber.email)}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 disabled:opacity-50 transition-colors duration-200"
            title="Unsubscribe user"
          >
            {isLoading ? 'Loading...' : 'Unsubscribe'}
          </button>
        )}

        <button
          onClick={() => onRemove(subscriber.id, subscriber.email)}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors duration-200"
          title="Remove contact permanently"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Subscriber Detail Modal Component
interface SubscriberDetailModalProps {
  subscriber: ResendContact;
  onClose: () => void;
}

function SubscriberDetailModal({ subscriber, onClose }: SubscriberDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subscriber Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{subscriber.email}</p>
            </div>

            {subscriber.firstName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="text-sm text-gray-900">{subscriber.firstName}</p>
              </div>
            )}

            {subscriber.lastName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-sm text-gray-900">{subscriber.lastName}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Subscribed Date</label>
              <p className="text-sm text-gray-900">
                {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                subscriber.unsubscribed 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {subscriber.unsubscribed ? 'Unsubscribed' : 'Active'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact ID</label>
              <p className="text-xs text-gray-500 font-mono">{subscriber.id}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}