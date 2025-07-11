# Study Assistant App

A comprehensive AI-powered study assistant application to help students learn more effectively.

## 🚀 Features

### Core Features
- **User Authentication**: Secure login/register with email verification and password reset
- **Category-based Setup**: Different flows for school students, college students, working professionals, and research scholars
- **Personalized Study Plans**: AI-generated study plans based on user goals and current performance
- **Study Timer**: Pomodoro technique implementation with focus sessions
- **Flashcards**: Spaced repetition learning system
- **Notes Management**: Organized note-taking with tags and subjects
- **Drawing Board**: Miro-like drawing board for flowcharts and visual learning
- **Progress Analytics**: Detailed analytics and progress tracking
- **Mock Tests**: AI-generated practice tests and assessments
- **Study Groups**: Collaborative learning spaces
- **Calendar Integration**: Study scheduling and deadline tracking
- **Focus Music**: Curated music and sounds for concentration
- **Text Summarizer**: AI-powered text summarization tool
- **AI Doubt Solver**: Get instant solutions to academic questions

### AI Features
- **Multiple AI Providers**: Support for OpenAI, Hugging Face, Roq, and mock services
- **Smart Study Plans**: Personalized recommendations based on user profile
- **Intelligent Summarization**: Extract key points from study materials
- **Doubt Resolution**: Step-by-step solutions with explanations

### Technical Features
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js with Express, SQLite database
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Email**: Nodemailer for email verification and password reset
- **Security**: Helmet, CORS, rate limiting, input validation
- **AI Integration**: Configurable AI services with fallback support

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Supabase account (free tier available)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd study-assistant-app
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy your Project URL and anon public key

3. **Set up the database**:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`
   - Then run the SQL from `supabase/migrations/002_auth_trigger.sql`
   - This will create all necessary tables and security policies

### 4. Environment Configuration

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your Supabase credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Start the Application

```bash
npm run dev
```

### 6. Access the Application

- **Application**: http://localhost:5173
- **Supabase Dashboard**: Your Supabase project dashboard

## 📁 Project Structure

```
study-assistant-app/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   ├── contexts/               # React contexts (Auth, etc.)
│   ├── lib/                    # Supabase client and utilities
│   ├── pages/                  # Page components
│   ├── services/               # API service functions
│   └── main.tsx               # App entry point
├── supabase/                   # Supabase configuration
│   ├── config.toml            # Supabase local config
│   └── migrations/            # Database migrations
├── public/                     # Static assets
├── package.json               # Frontend dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🗄️ Database Features

### Supabase Integration
- **Authentication**: Built-in user authentication with email/password
- **Real-time**: Real-time subscriptions for collaborative features
- **Row Level Security**: Secure data access with RLS policies
- **Edge Functions**: Serverless functions for AI integrations
- **Storage**: File storage for user uploads

### Database Tables
- `users` - User profiles and study goals
- `study_sessions` - Study session tracking
- `goal_tracking` - Daily progress monitoring
- `notifications` - User notifications
- `flashcards` - Spaced repetition flashcards
- `notes` - Study notes with tags
- `study_groups` - Collaborative study groups
- `study_group_members` - Group memberships
- `doubts` - AI-powered doubt solving

## 💻 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎯 Features by User Category

### School Students
- Basic study tools and timers
- Simple flashcards and notes
- Grade-appropriate content

### College Students
- Advanced study planning
- Subject-specific organization
- Collaboration features

### Working Professionals
- Skill-based learning paths
- Time-efficient study methods
- Career-focused content

### Research Scholars
- Research-oriented tools
- Advanced analytics
- Academic collaboration features

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection Error**:
   - Verify your Supabase URL and anon key in `.env`
   - Check if your Supabase project is active
   - Ensure you've run the database migrations

2. **Authentication Issues**:
   - Check Supabase Auth settings in your dashboard
   - Verify email confirmation is disabled for development
   - Check browser console for detailed error messages

3. **Database Errors**:
   - Ensure you've run the SQL migration in Supabase
   - Check Row Level Security policies are properly set
   - Verify user permissions in Supabase dashboard

4. **Frontend Not Loading**:
   - Ensure all dependencies are installed: `npm install`
   - Check environment variables are set correctly
   - Clear browser cache and localStorage

### Development Tips

1. **Database Reset**:
   - Go to Supabase SQL Editor
   - Drop tables and re-run the migration SQL
   - Or reset from Supabase dashboard

2. **Clear Browser Data**:
   - Clear localStorage and cookies for fresh start

3. **Check Logs**:
   - Supabase logs in dashboard
   - Frontend errors in browser console
   - Network tab for API call debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase documentation
2. Review the code comments
3. Create an issue in the repository

## 🚀 Future Enhancements

- Enhanced real-time collaboration
- Mobile app development
- Advanced AI tutoring with OpenAI integration
- Integration with learning management systems
- Offline functionality
- Voice-to-text note taking
- Advanced analytics with custom charts
- Push notifications
- File sharing in study groups