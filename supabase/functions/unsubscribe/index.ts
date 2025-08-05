import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    // Get unsubscribe token from URL parameters
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(
        generateUnsubscribePage('Error', 'Invalid unsubscribe link. Please contact support.', false),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        }
      )
    }

    // Find subscriber by token and deactivate
    const { data: subscriber, error: findError } = await supabase
      .from('email_subscribers')
      .select('email, is_active')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !subscriber) {
      return new Response(
        generateUnsubscribePage('Error', 'Invalid unsubscribe link or subscriber not found.', false),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        }
      )
    }

    if (!subscriber.is_active) {
      return new Response(
        generateUnsubscribePage('Already Unsubscribed', 'You have already been unsubscribed from our mailing list.', true),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        }
      )
    }

    // Deactivate subscription
    const { error: updateError } = await supabase
      .from('email_subscribers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)

    if (updateError) {
      throw new Error(`Failed to unsubscribe: ${updateError.message}`)
    }

    return new Response(
      generateUnsubscribePage('Successfully Unsubscribed', 'You have been successfully unsubscribed from Continued Education blog notifications.', true),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    )

  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    
    return new Response(
      generateUnsubscribePage('Error', 'An error occurred while processing your request. Please try again later.', false),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    )
  }
})

function generateUnsubscribePage(title: string, message: string, success: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Continued Education</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #f8f9fa;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .header {
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .message {
          font-size: 18px;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .button:hover {
          background: #5a6fd8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Continued Education</div>
        </div>
        
        <div class="icon ${success ? 'success' : 'error'}">
          ${success ? '✓' : '✗'}
        </div>
        
        <h1>${title}</h1>
        <p class="message">${message}</p>
        
        <a href="/" class="button">Return to Blog</a>
      </div>
    </body>
    </html>
  `
}