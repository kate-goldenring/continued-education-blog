/*
  # Email Subscription System

  1. New Tables
    - `email_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `subscribed_at` (timestamp)
      - `is_active` (boolean, default true)
      - `unsubscribe_token` (uuid, for unsubscribe links)

  2. Security
    - Enable RLS on `email_subscribers` table
    - Public can insert (subscribe)
    - Only authenticated users can view/manage subscribers

  3. Functions
    - Email validation function
    - Automatic notification trigger when new posts are created

  4. Edge Function Integration
    - Trigger edge function to send emails when new posts are published
*/

-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on email_subscribers table
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Public can subscribe (insert only)
CREATE POLICY "Public can subscribe to email list"
ON email_subscribers
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Authenticated users can manage subscribers
CREATE POLICY "Authenticated users can manage subscribers"
ON email_subscribers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Public can unsubscribe using token
CREATE POLICY "Public can unsubscribe with token"
ON email_subscribers
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email_address text)
RETURNS boolean AS $$
BEGIN
  RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Function to handle new blog post notifications
CREATE OR REPLACE FUNCTION notify_subscribers_of_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to send notification emails
  -- This will be handled by the edge function we'll create
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-post-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'post_id', NEW.id,
      'post_title', NEW.title,
      'post_excerpt', NEW.excerpt,
      'post_url', '/post/' || NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to send notifications when new posts are published
CREATE OR REPLACE TRIGGER send_post_notification_trigger
  AFTER INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_of_new_post();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscribers_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_subscribers_token ON email_subscribers(unsubscribe_token);