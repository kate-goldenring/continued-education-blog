import { emailService } from './emailService';

export interface SubscriptionResult {
  success: boolean;
  message: string;
  error?: string;
}

class SubscriptionService {
  /**
   * Subscribe an email to the blog notifications using Resend
   */
  async subscribe(email: string, firstName?: string, lastName?: string): Promise<SubscriptionResult> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.',
          error: 'Invalid email format'
        };
      }

      // Add contact to Resend audience
      const result = await emailService.addContact(email, firstName, lastName);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Failed to subscribe. Please try again later.',
          error: result.error
        };
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
   * Unsubscribe using email address
   */
  async unsubscribe(email: string): Promise<SubscriptionResult> {
    try {
      // Find contact by email
      const contactResult = await emailService.getContactByEmail(email);
      
      if (!contactResult.success || !contactResult.contact) {
        return {
          success: false,
          message: 'Email address not found in our subscriber list.',
          error: 'Contact not found'
        };
      }

      // Update subscription status
      const result = await emailService.updateContactSubscription(contactResult.contact.id, true);

      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Failed to unsubscribe. Please try again later.',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from our newsletter.'
      };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again later.',
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
      return await emailService.getSubscriptionStats();
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
    firstName?: string;
    lastName?: string;
  }>> {
    try {
      const result = await emailService.getAllContacts();
      
      if (!result.success || !result.contacts) {
        return [];
      }

      return result.contacts.map(contact => ({
        id: contact.id,
        email: contact.email,
        subscribedAt: contact.createdAt,
        isActive: !contact.unsubscribed,
        firstName: contact.firstName,
        lastName: contact.lastName
      }));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return [];
    }
  }

  /**
   * Send notification emails to all subscribers when a new post is created
   */
  async notifySubscribersOfNewPost(postData: {
    id: string;
    title: string;
    excerpt: string;
  }): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    try {
      // Send broadcast email using Resend
      const result = await emailService.sendPostNotification({
        postId: postData.id,
        postTitle: postData.title,
        postExcerpt: postData.excerpt,
        postUrl: `/post/${postData.id}`
      });

      return result;
    } catch (error) {
      console.error('Error notifying subscribers:', error);
      return {
        success: false,
        sentCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Export subscribers to CSV format
   */
  async exportSubscribers(): Promise<string> {
    try {
      const subscribers = await this.getAllSubscribers();
      const activeSubscribers = subscribers.filter(sub => sub.isActive);
      
      const csvContent = [
        'Email,First Name,Last Name,Subscribed Date,Status',
        ...activeSubscribers.map(sub => 
          `${sub.email},${sub.firstName || ''},${sub.lastName || ''},${new Date(sub.subscribedAt).toLocaleDateString()},Active`
        )
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      return 'Email,First Name,Last Name,Subscribed Date,Status\n';
    }
  }

  /**
   * Create audience in Resend (one-time setup)
   */
  async createAudience(name: string): Promise<{ success: boolean; audienceId?: string; error?: string }> {
    return await emailService.createAudience(name);
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