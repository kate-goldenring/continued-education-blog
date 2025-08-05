import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Resend Audience ID - you'll need to create this in your Resend dashboard
export interface EmailNotificationData {
  postId: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
}

export interface Subscriber {
  id: string;
  email: string;
  unsubscribeToken: string;
}

class EmailService {
  /**
   * Send new post notification to all subscribers
   */
  async sendPostNotification(
    subscribers: Subscriber[], 
    postData: EmailNotificationData
  ): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      console.warn('Resend API key not configured. Email notifications disabled.');
      return { success: false, sentCount: 0, errors: ['Resend API key not configured'] };
    }

    const errors: string[] = [];
    let sentCount = 0;

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${window.location.origin}/unsubscribe?token=${subscriber.unsubscribeToken}`;
          
          await resend.emails.send({
            from: 'Continued Education <noreply@yourdomain.com>', // Update with your domain
            to: subscriber.email,
            subject: `New Post: ${postData.postTitle}`,
            html: this.generateEmailTemplate(postData, unsubscribeUrl)
          });
          
          sentCount++;
          console.log(`Email sent successfully to: ${subscriber.email}`);
        } catch (error) {
          const errorMessage = `Failed to send to ${subscriber.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: errors.length === 0,
      sentCount,
      errors
    };
  }

  /**
   * Generate HTML email template
   */
  private generateEmailTemplate(postData: EmailNotificationData, unsubscribeUrl: string): string {
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
              <a href="${unsubscribeUrl}">Unsubscribe here</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name (optional)
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="First name"
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name (optional)
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Last name"
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
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
}

export const emailService = new EmailService();

export default emailService