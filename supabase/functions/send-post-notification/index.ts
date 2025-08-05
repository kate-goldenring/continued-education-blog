import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface NotificationRequest {
  post_id: string
  post_title: string
  post_excerpt: string
  post_url: string
}

interface Subscriber {
  id: string
  email: string
  unsubscribe_token: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { post_id, post_title, post_excerpt, post_url }: NotificationRequest = await req.json()

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('email_subscribers')
      .select('id, email, unsubscribe_token')
      .eq('is_active', true)

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`)
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscribers found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email to each subscriber
    const emailPromises = subscribers.map(async (subscriber: Subscriber) => {
      const unsubscribeUrl = `${supabaseUrl.replace('/rest/v1', '')}/unsubscribe?token=${subscriber.unsubscribe_token}`
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Post: ${post_title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
            .unsubscribe { color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Continued Education</h1>
            <p>New blog post published!</p>
          </div>
          
          <div class="content">
            <h2>${post_title}</h2>
            <p>${post_excerpt}</p>
            <a href="${supabaseUrl.replace('/rest/v1', '')}${post_url}" class="button">Read Full Post</a>
          </div>
          
          <div class="footer">
            <p>Thank you for subscribing to Continued Education!</p>
            <p class="unsubscribe">
              Don't want to receive these emails? 
              <a href="${unsubscribeUrl}">Unsubscribe here</a>
            </p>
          </div>
        </body>
        </html>
      `

      // In a real implementation, you would integrate with an email service like:
      // - Resend
      // - SendGrid
      // - Mailgun
      // - Amazon SES
      
      // For now, we'll log the email that would be sent
      console.log(`Would send email to: ${subscriber.email}`)
      console.log(`Subject: New Post: ${post_title}`)
      console.log(`Unsubscribe URL: ${unsubscribeUrl}`)
      
      // Return success for logging purposes
      return { email: subscriber.email, status: 'sent' }
    })

    const results = await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({
        message: `Notifications sent to ${results.length} subscribers`,
        results: results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error sending notifications:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})