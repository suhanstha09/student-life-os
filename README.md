# Student Life OS

A productivity and organization platform for students, built with React, Vite, Supabase, and Tailwind CSS.

## Features
- Dashboard with personalized greeting and stats
- Assignments management
- Focus sessions and analytics
- Second Brain (notes with PDF/image attachments)
- Learning log
- User profile (display name, real name, email, phone, education)
- Supabase authentication and storage

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd student-life-os-1
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase project credentials.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open in your browser:**
   - Visit [http://localhost:8080](http://localhost:8080)

## Database Setup
- Make sure your Supabase project has the required tables: `assignments`, `notes`, `focus_sessions`, `learning_items`, `profiles` (see `/supabase/migrations/` for SQL).
- Enable authentication in Supabase.

## License
This project is private and not open source. All rights reserved.

