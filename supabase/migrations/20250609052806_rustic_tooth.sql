/*
  # Create Blog Posts Table

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `category` (text, required)
      - `image_url` (text, required)
      - `images` (text array, optional additional images)
      - `excerpt` (text, required)
      - `content` (text, required)
      - `read_time` (text, calculated)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `blog_posts` table
    - Add policy for public read access
    - Add policy for authenticated users to manage posts

  3. Functions
    - Auto-update timestamp trigger
    - Read time calculation function
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'lifestyle',
  image_url text NOT NULL,
  images text[] DEFAULT '{}',
  excerpt text NOT NULL,
  content text NOT NULL,
  read_time text NOT NULL DEFAULT '1 min read',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on blog_posts table
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read all blog posts
CREATE POLICY "Public can read blog posts"
ON blog_posts
FOR SELECT
TO public
USING (true);

-- Policy: Authenticated users can manage all blog posts
CREATE POLICY "Authenticated users can manage blog posts"
ON blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to calculate read time based on content
CREATE OR REPLACE FUNCTION calculate_read_time(content_text text)
RETURNS text AS $$
DECLARE
  word_count integer;
  read_minutes integer;
BEGIN
  -- Count words (split by whitespace)
  word_count := array_length(string_to_array(trim(content_text), ' '), 1);
  
  -- Calculate reading time (200 words per minute)
  read_minutes := GREATEST(1, CEIL(word_count::float / 200));
  
  RETURN read_minutes || ' min read';
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update read_time and updated_at
CREATE OR REPLACE FUNCTION update_blog_post_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.read_time = calculate_read_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metadata
CREATE TRIGGER update_blog_post_metadata_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_metadata();

-- Insert sample data from the existing blog posts
INSERT INTO blog_posts (title, category, image_url, images, excerpt, content, created_at) VALUES
(
  'Sunrise at Mount Whitney',
  'hiking',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'An unforgettable journey to the highest peak in the contiguous United States.',
  '# Sunrise at Mount Whitney

The alarm went off at 2:30 AM, but I was already awake. Today was the day I''d been preparing for months – summiting Mount Whitney, the highest peak in the contiguous United States at 14,505 feet.

## The Journey Begins

Starting from Whitney Portal at 8,365 feet, the 22-mile round trip hike would test every ounce of preparation I''d put in. The pre-dawn darkness was pierced only by our headlamps as we began the steady climb through the Alabama Hills.

## Above the Treeline

As we climbed higher, the landscape transformed dramatically. The familiar pine trees gave way to stark granite formations and alpine lakes that reflected the emerging dawn light. The air grew thinner with each step, reminding us of the altitude challenge ahead.

## The Final Push

The last two miles to the summit felt like the longest part of the entire journey. Switch-backing up the famous 99 switchbacks, each step required deliberate effort in the thin air. But as the sun crested the eastern horizon, painting the Sierra Nevada range in brilliant oranges and pinks, every challenging step felt worth it.

## Summit Success

Standing on the summit of Mount Whitney as the sun rose was one of the most profound moments of my life. The 360-degree views stretched across California and Nevada, with peaks extending to the horizon in every direction. The sense of accomplishment, combined with the raw beauty of the Sierra Nevada, created a memory I''ll treasure forever.

The descent reminded us that reaching the summit is only halfway – but with the sunrise experience burned into our memories, even the long hike down felt like a celebration.',
  '2024-03-15'::date
),
(
  'Street Food Adventures in Bangkok',
  'travel',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Discovering the vibrant culinary scene in Thailand''s bustling capital.',
  '# Street Food Adventures in Bangkok

Bangkok''s street food scene is legendary, and after spending two weeks exploring the city''s culinary landscape, I can confirm that every bit of hype is deserved.

## Chatuchak Weekend Market

Our first stop was the famous Chatuchak Weekend Market, where over 200,000 visitors come each weekend. The food section alone could keep you busy for days. From traditional pad thai prepared right before your eyes to exotic fruit smoothies, every stall offers something unique.

## Khao San Road Night Market

As the sun set, we made our way to Khao San Road, where the energy is electric and the food is incredible. The aroma of grilled meats, fresh herbs, and spicy chilies fills the air. We tried everything from mango sticky rice to spicy papaya salad, each dish bursting with authentic Thai flavors.

## Hidden Gems

The real magic happened when we ventured off the tourist path. Small family-run stalls tucked into residential neighborhoods served some of the best food we''ve ever tasted. A simple bowl of boat noodles from a street vendor became one of our most memorable meals.

## The Perfect Balance

What struck me most about Bangkok''s street food culture is the perfect balance of flavors – sweet, sour, salty, and spicy all harmoniously combined in each dish. Every meal was an adventure, every bite a discovery.

Bangkok didn''t just feed our bodies; it fed our souls with its incredible hospitality and culinary artistry.',
  '2024-02-28'::date
),
(
  'Homemade Sourdough Journey',
  'food',
  'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4686818/pexels-photo-4686818.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Six months of perfecting the art of sourdough bread making.',
  '# Homemade Sourdough Journey

Six months ago, I started what would become an obsession: creating the perfect sourdough bread from scratch.

## Creating the Starter

It all began with flour, water, and patience. Creating a sourdough starter from wild yeast in the environment takes time and dedication. For the first week, I fed my starter twice daily, watching for signs of life – bubbles, growth, and that distinctive tangy aroma.

## The Learning Curve

My first loaves were... let''s call them learning experiences. Dense, flat, and barely resembling bread, they taught me valuable lessons about hydration, timing, and the importance of gluten development.

## Finding the Rhythm

Sourdough taught me to slow down. Unlike commercial yeast, sourdough works on its own timeline. I learned to read the signs – how the dough feels, looks, and smells at each stage of the process.

## The Perfect Loaf

After months of practice, I finally achieved what I''d been working toward: a loaf with a crispy, golden crust and an open, airy crumb with those coveted holes. The flavor was complex and tangy, with a depth that only comes from long fermentation.

## More Than Bread

This journey became about more than bread. It connected me to an ancient tradition, taught me patience, and gave me a deeper appreciation for the craft of baking. Every loaf is still a small celebration of this beautiful, living process.',
  '2024-01-20'::date
),
(
  'Northern Lights in Iceland',
  'photography',
  'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1933304/pexels-photo-1933304.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2113561/pexels-photo-2113561.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Chasing the aurora borealis across Iceland''s dramatic landscape.',
  '# Northern Lights in Iceland

Iceland in March offered the perfect conditions for aurora hunting – long nights, clear skies, and minimal light pollution outside Reykjavik.

## The Hunt Begins

Armed with camera gear and weather apps, we spent our first three nights driving the Ring Road, searching for breaks in the clouds. The anticipation built with each clear patch of sky, but the aurora remained elusive.

## Patience Pays Off

On our fourth night, everything aligned. Clear skies, strong solar activity, and a remote location near Jökulsárlón glacier lagoon. As darkness fell, a faint green glow appeared on the northern horizon.

## Nature''s Light Show

What started as a subtle glow transformed into dancing curtains of green and purple light. The aurora moved across the sky like silk ribbons in the wind, creating shapes that defied description. We spent four hours in sub-zero temperatures, completely mesmerized.

## Technical Challenges

Photographing the northern lights required patience and technical skill. Long exposures, manual focus in the dark, and constantly adjusting settings as the aurora''s intensity changed. But when everything came together – the perfect shot of the aurora reflecting in the glacier lagoon – it was pure magic.

## More Than Photography

While I came to Iceland for photography, I left with something much more valuable: a deep appreciation for the raw power and beauty of our planet. The aurora reminded me that we''re part of something much larger and more magnificent than ourselves.',
  '2024-03-01'::date
),
(
  'Minimalist Living Experiment',
  'lifestyle',
  'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'What I learned from living with only 100 possessions for a year.',
  '# Minimalist Living Experiment

A year ago, I challenged myself to live with only 100 possessions. Here''s what I learned from this transformative experience.

## The Great Purge

Reducing my belongings from thousands to just 100 items was initially overwhelming. Every possession had to justify its place in my life. I asked myself: Does this add value? Do I actually use this? What would happen if I didn''t have this?

## Defining Essentials

The process taught me to distinguish between wants and needs. I kept items that served multiple purposes and brought genuine joy or utility to my life. Everything else had to go.

## Unexpected Freedom

Within a few months, I experienced an unexpected sense of freedom. Less stuff meant less to maintain, organize, and worry about. My living space felt calmer, and I could find everything I owned within minutes.

## Mindful Consumption

The biggest change was in my relationship with consumption. Before buying anything new, I had to consider what I would remove to stay at 100 items. This made every purchase decision much more intentional.

## Quality Over Quantity

With fewer possessions, I could invest in higher-quality items that lasted longer and performed better. My 100 items were carefully chosen for durability and functionality.

## The Real Lesson

The year taught me that happiness doesn''t come from accumulating things. Peace of mind, experiences, and relationships matter far more than any material possession. While I''ve since relaxed the strict 100-item rule, the mindset shift has permanently changed how I approach consumption and what I value in life.',
  '2024-01-05'::date
),
(
  'Backpacking Through Patagonia',
  'travel',
  'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY[
    'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Three weeks exploring the remote wilderness of South America.',
  '# Backpacking Through Patagonia

Patagonia had been calling to me for years – a remote wilderness at the end of the world where condors soar above granite peaks and glacial lakes reflect snow-capped mountains.

## Planning the Adventure

Three weeks, two countries (Chile and Argentina), and countless miles of hiking lay ahead. The logistics alone were challenging – remote locations, unpredictable weather, and the need to be completely self-sufficient for days at a time.

## Torres del Paine

Our first major destination was Torres del Paine National Park in Chile. The famous "W" trek offered some of the most spectacular scenery I''ve ever witnessed. The iconic granite towers rising from the Patagonian steppe created a landscape that felt almost otherworldly.

## Weather Challenges

Patagonian weather is legendary for its unpredictability. We experienced everything from brilliant sunshine to horizontal rain and snow – sometimes all in the same hour. The wind was a constant companion, requiring us to secure everything and adjust our hiking pace accordingly.

## Perito Moreno Glacier

Crossing into Argentina, we visited the Perito Moreno Glacier. Standing before this massive wall of ice, listening to it crack and groan as it slowly moved toward the lake, was a humbling reminder of the Earth''s power and the effects of climate change.

## Fitz Roy Circuit

The crown jewel of our trip was the Fitz Roy circuit near El Calafate. The jagged peak of Cerro Fitz Roy, shrouded in clouds for most of our visit, finally revealed itself on our last morning, creating a sunrise that will be etched in my memory forever.

## Life-Changing Experience

Patagonia challenged me physically and mentally while rewarding me with some of the most pristine wilderness left on Earth. The silence, the scale, and the raw beauty of this region reminded me why we must protect these special places for future generations.',
  '2024-02-10'::date
);