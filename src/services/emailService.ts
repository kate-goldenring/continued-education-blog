import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Resend Audience ID - you'll need to create this in your Resend dashboard
const AUDIENCE_ID = import.meta.env.VITE_RESEND_AUDIENCE_ID || 'your-audience-id';

export interface EmailNotificationData {
  postId: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
}

export interface ResendContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  unsubscribed: boolean;
}

export interface ResendAudience {
  id: string;
  name: string;
}

class EmailService {
  /**
   * Create an audience in Resend (one-time setup)
   */
  async createAudience(name: string): Promise<{ success: boolean; audienceId?: string; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      const response = await resend.audiences.create({ name });
      return { success: true, audienceId: response.data?.id };
    } catch (error) {
      console.error('Failed to create audience:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create audience' 
      };
    }
  }

  /**
   * Add a contact to the Resend audience
   */
  async addContact(email: string, firstName?: string, lastName?: string): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    if (!AUDIENCE_ID || AUDIENCE_ID === 'your-audience-id') {
      return { success: false, error: 'Resend Audience ID not configured' };
    }

    try {
      const response = await resend.contacts.create({
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        unsubscribed: false,
        audienceId: AUDIENCE_ID
      });

      return { success: true, contactId: response.data?.id };
    } catch (error: any) {
      console.error('Failed to add contact:', error);
      
      // Handle duplicate email error
      if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
        return { success: false, error: 'This email is already subscribed to our newsletter.' };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add contact' 
      };
    }
  }

  /**
   * Remove a contact from the audience (unsubscribe)
   */
  async removeContact(contactId: string): Promise<{ success: boolean; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      await resend.contacts.remove({ 
        id: contactId,
        audienceId: AUDIENCE_ID 
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to remove contact:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove contact' 
      };
    }
  }

  /**
   * Update contact subscription status
   */
  async updateContactSubscription(contactId: string, unsubscribed: boolean): Promise<{ success: boolean; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      await resend.contacts.update({
        id: contactId,
        audienceId: AUDIENCE_ID,
        unsubscribed
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to update contact:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update contact' 
      };
    }
  }

  /**
   * Get all contacts from the audience
   */
  async getAllContacts(): Promise<{ success: boolean; contacts?: ResendContact[]; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    if (!AUDIENCE_ID || AUDIENCE_ID === 'your-audience-id') {
      return { success: false, error: 'Resend Audience ID not configured' };
    }

    try {
      const response = await resend.contacts.list({ audienceId: AUDIENCE_ID });
      
      const contacts: ResendContact[] = response.data?.data?.map((contact: any) => ({
        id: contact.id,
        email: contact.email,
        firstName: contact.first_name,
        lastName: contact.last_name,
        createdAt: contact.created_at,
        unsubscribed: contact.unsubscribed
      })) || [];

      return { success: true, contacts };
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get contacts' 
      };
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<{ success: boolean; contact?: ResendContact; error?: string }> {
    const result = await this.getAllContacts();
    
    if (!result.success || !result.contacts) {
      return { success: false, error: result.error };
    }

    const contact = result.contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    return { success: true, contact };
  }

  /**
   * Send new post notification to all subscribers using Resend Broadcast
   */
  async sendPostNotification(postData: EmailNotificationData): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      console.warn('Resend API key not configured. Email notifications disabled.');
      return { success: false, sentCount: 0, errors: ['Resend API key not configured'] };
    }

    if (!AUDIENCE_ID || AUDIENCE_ID === 'your-audience-id') {
      console.warn('Resend Audience ID not configured. Email notifications disabled.');
      return { success: false, sentCount: 0, errors: ['Resend Audience ID not configured'] };
    }

    try {
      // Send broadcast email to the entire audience
      const response = await resend.broadcasts.send({
        from: 'Continued Education <noreply@yourdomain.com>', // Update with your verified domain
        subject: `New Post: ${postData.postTitle}`,
        html: this.generateEmailTemplate(postData),
        audienceId: AUDIENCE_ID
      });

      console.log('Broadcast email sent successfully:', response.data?.id);
      
      // Get subscriber count for reporting
      const contactsResult = await this.getAllContacts();
      const activeSubscribers = contactsResult.contacts?.filter(c => !c.unsubscribed).length || 0;

      return {
        success: true,
        sentCount: activeSubscribers,
        errors: []
      };
    } catch (error) {
      console.error('Failed to send broadcast email:', error);
      return {
        success: false,
        sentCount: 0,
        errors: [error instanceof Error ? error.message : 'Failed to send broadcast email']
      };
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailTemplate(postData: EmailNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Post: ${postData.postTitle}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 0;
            opacity: 0.9;
          }
          .content { 
            padding: 30px; 
          }
          .content h2 {
            color: #333;
            font-size: 24px;
            margin: 0 0 15px 0;
            line-height: 1.3;
          }
          .content p {
            color: #666;
            font-size: 16px;
            margin: 0 0 25px 0;
          }
          .button { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px;
            transition: background-color 0.3s;
          }
          .button:hover {
            background: #5a6fd8;
          }
          .footer { 
            text-align: center; 
            color: #999; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding: 20px 30px; 
            background: #f8f9fa;
          }
          .unsubscribe { 
            color: #999; 
            font-size: 12px; 
            margin-top: 15px;
          }
          .unsubscribe a {
            color: #667eea;
            text-decoration: none;
          }
          .unsubscribe a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Continued Education</h1>
            <p>New adventure published!</p>
          </div>
          
          <div class="content">
            <h2>${postData.postTitle}</h2>
            <p>${postData.postExcerpt}</p>
            <a href="${window.location.origin}${postData.postUrl}" class="button">Read Full Post</a>
          </div>
          
          <div class="footer">
            <p>Thank you for subscribing to Continued Education!</p>
            <p>You're receiving this because you subscribed to our blog updates.</p>
            <div class="unsubscribe">
              Don't want to receive these emails? 
              <a href="{{unsubscribe}}">Unsubscribe here</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    try {
      await resend.emails.send({
        from: 'Continued Education <noreply@yourdomain.com>', // Update with your domain
        to: 'test@example.com',
        subject: 'Test Email Configuration',
        html: '<p>This is a test email to verify Resend configuration.</p>'
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
  }> {
    const result = await this.getAllContacts();
    
    if (!result.success || !result.contacts) {
      return {
        totalSubscribers: 0,
        activeSubscribers: 0
      };
    }

    const totalSubscribers = result.contacts.length;
    const activeSubscribers = result.contacts.filter(c => !c.unsubscribed).length;

    return {
      totalSubscribers,
      activeSubscribers
    };
  }
}

export const emailService = new EmailService();