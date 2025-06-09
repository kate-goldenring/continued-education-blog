# Visual Stories Blog

A beautiful, responsive blog application built with React, TypeScript, Tailwind CSS, and Supabase authentication.

## Features

- 📱 Responsive masonry-style photo gallery
- 🔐 Supabase authentication system
- ✍️ Rich admin panel for content management
- 🖼️ Photo galleries with lightbox viewer
- 🏷️ Category filtering
- 📝 Markdown-style content editing
- 🎨 Beautiful, production-ready design

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd visual-stories-blog
npm install
```

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be set up

2. **Get Your Credentials**
   - Go to Settings > API
   - Copy your Project URL and anon/public key

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set Up Authentication**
   - In your Supabase dashboard, go to Authentication > Settings
   - Configure your site URL (e.g., `http://localhost:5173` for development)
   - Disable email confirmations for easier development (optional)

5. **Create Admin User**
   - Go to Authentication > Users
   - Click "Add user"
   - Create an admin user with email and password
   - This will be your login credentials

### 3. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Authentication

The application uses Supabase Authentication with the following features:

- **Email/Password Authentication**: Secure login with Supabase Auth
- **Session Management**: Automatic session handling and persistence
- **Protected Routes**: Admin routes require authentication
- **Real-time Auth State**: Automatic updates when auth state changes

### Admin Access

1. Navigate to `/login` or click the settings icon in the gallery
2. Use the email and password you created in Supabase
3. Access the admin panel to manage blog posts

## Supabase Configuration

### Authentication Settings

In your Supabase dashboard:

1. **Authentication > Settings**:
   - Site URL: `http://localhost:5173` (development) or your production URL
   - Redirect URLs: Add your domain(s)

2. **Authentication > Email Templates** (optional):
   - Customize email templates for password reset, etc.

3. **Authentication > Providers** (optional):
   - Enable additional providers like Google, GitHub, etc.

### Security

- Email confirmation is disabled by default for easier development
- In production, enable email confirmation and configure SMTP
- Row Level Security (RLS) can be added for additional data protection

## Development

### Project Structure

```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── auth/           # Authentication components
│   └── ...             # Other components
├── contexts/           # React contexts (AuthContext)
├── lib/                # Supabase client configuration
├── types/              # TypeScript type definitions
└── ...
```

### Key Files

- `src/lib/supabase.ts` - Supabase client configuration
- `src/contexts/AuthContext.tsx` - Authentication context and logic
- `src/components/auth/LoginForm.tsx` - Login form component
- `src/components/auth/ProtectedRoute.tsx` - Route protection

## Deployment

### Environment Variables for Production

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Supabase Production Setup

1. Update Site URL in Supabase dashboard to your production domain
2. Configure redirect URLs for your production domain
3. Enable email confirmation and configure SMTP for production
4. Set up proper RLS policies if needed

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Routing**: React Router
- **Icons**: Lucide React
- **Build Tool**: Vite

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Make sure you have a `.env` file with the correct variables
   - Restart the development server after adding environment variables

2. **Authentication not working**
   - Check that your Supabase project URL and anon key are correct
   - Verify the site URL is configured in Supabase dashboard
   - Make sure you have created a user in the Supabase dashboard

3. **Login redirects not working**
   - Check redirect URLs in Supabase dashboard
   - Ensure site URL matches your development/production domain

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)