import { supabase } from '../lib/supabase';

export interface SubscriptionResult {
  success: boolean;
  message: string;
  error?: string;
}

class SubscriptionService {
  /**
   * Subscribe an email to the blog notifications
   */
  async subscribe(email: string): Promise<SubscriptionResult> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.',
          error: 'Invalid email format'
        };
      }

      // Attempt to insert the email
      const { data, error } = await supabase
        .from('email_subscribers')
        .insert([{ email: email.toLowerCase().trim() }])
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') { // PostgreSQL unique violation
          return {
            success: false,
            message: 'This email is already subscribed to our newsletter.',
            error: 'Email already exists'
          };
        }
        
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Successfully subscribed! You\'ll receive notifications when new posts are published.'
      };
    } catch (error) {
      console.error('Subscription error:', error);
      return {
        success: false,
        message: 'Failed to subscribe. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get subscription statistics (for admin use)
   */
  async getSubscriptionStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
  }> {
    try {
      const { data: total, error: totalError } = await supabase
        .from('email_subscribers')
        .select('id', { count: 'exact', head: true });

      const { data: active, error: activeError } = await supabase
        .from('email_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      if (totalError || activeError) {
        throw new Error('Failed to fetch subscription stats');
      }

      return {
        totalSubscribers: total?.length || 0,
        activeSubscribers: active?.length || 0
      };
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      return {
        totalSubscribers: 0,
        activeSubscribers: 0
      };
    }
  }

  /**
   * Get all subscribers (admin only)
   */
  async getAllSubscribers(): Promise<Array<{
    id: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
  }>> {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('id, email, subscribed_at, is_active')
        .order('subscribed_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(subscriber => ({
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribed_at,
        isActive: subscriber.is_active
      }));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }
}

export const subscriptionService = new SubscriptionService();