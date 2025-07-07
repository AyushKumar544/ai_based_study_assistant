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

### 3. Environment Configuration

1. **Copy environment file**:
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   ```env
   # JWT Secret (Generate a strong secret key)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

   # Email Configuration (Optional - for password reset and verification)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Client URL
   CLIENT_URL=http://localhost:5173

   # Server Port
   PORT=3001

   # AI API Configuration (Choose one)
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo

   # Hugging Face Configuration (Alternative to OpenAI)
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   HUGGINGFACE_MODEL=microsoft/DialoGPT-medium

   # Roq Configuration (Alternative AI service)
   ROQ_API_KEY=your_roq_api_key_here
   ROQ_API_URL=https://api.roq.ai

   # AI Service Provider (openai, huggingface, roq, or mock)
   AI_PROVIDER=mock
   ```

### 4. AI Service Setup (Optional)

The app works with mock AI services by default. To enable real AI features:

#### Option 1: OpenAI (Recommended)
1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set `OPENAI_API_KEY` and `AI_PROVIDER=openai` in `.env`

#### Option 2: Hugging Face
1. Get API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Set `HUGGINGFACE_API_KEY` and `AI_PROVIDER=huggingface` in `.env`

#### Option 3: Roq
1. Get API key from your Roq provider
2. Set `ROQ_API_KEY` and `AI_PROVIDER=roq` in `.env`

### 5. Email Setup (Optional)

For password reset and email verification features:

1. **Gmail Setup**:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: Google Account → Security → App passwords
   - Use the app password in the `EMAIL_PASS` field

### 6. Start the Application

#### Option 1: Start Both Services Separately

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

#### Option 2: Start Backend from Frontend (Alternative)
```bash
npm run server
```
Then in another terminal:
```bash
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📁 Project Structure

```
study-assistant-app/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   ├── contexts/               # React contexts (Auth, etc.)
│   ├── pages/                  # Page components
│   └── main.tsx               # App entry point
├── server/                     # Backend source code
│   ├── server.js              # Express server
│   ├── ai-service.js          # AI service integration
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment variables template
├── public/                     # Static assets
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `POST /api/auth/forgot-password` - Password reset request

### AI Services
- `POST /api/ai/generate-study-plan` - Generate personalized study plan
- `POST /api/ai/summarize` - Text summarization

### Doubt Solver
- `POST /api/doubts/ask` - Ask a question and get AI solution
- `GET /api/doubts/history` - Get user's doubt history
- `GET /api/doubts/:id` - Get specific doubt solution

### Health Check
- `GET /api/health` - Server health status and configuration

## 💻 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
cd server
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

## 🗄️ Database Schema

The application uses SQLite and automatically creates the following tables:
- `users` - User accounts and profiles
- `study_sessions` - Study session tracking
- `flashcards` - Flashcard data
- `notes` - User notes and study materials
- `study_groups` - Study group information
- `study_group_members` - Study group memberships
- `doubts` - User questions and AI solutions

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

1. **Backend Connection Error**:
   - Ensure backend server is running on port 3001
   - Check if JWT_SECRET is set in `.env`
   - Verify all dependencies are installed

2. **AI Features Not Working**:
   - Check AI_PROVIDER setting in `.env`
   - Verify API keys are correct
   - App falls back to mock services automatically

3. **Email Not Working**:
   - Verify email credentials in `.env`
   - Check Gmail app password setup
   - Email features are optional for basic functionality

4. **Frontend Not Loading**:
   - Ensure all dependencies are installed: `npm install`
   - Check if backend is running
   - Verify CORS configuration

### Development Tips

1. **Database Reset**:
   ```bash
   rm server/study_assistant.db
   # Restart server to recreate database
   ```

2. **Clear Browser Data**:
   - Clear localStorage and cookies for fresh start

3. **Check Logs**:
   - Backend logs appear in terminal
   - Frontend errors in browser console

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
2. Review the code comments
3. Create an issue in the repository

## 🚀 Future Enhancements

- Real-time collaboration features
- Mobile app development
- Advanced AI tutoring
- Integration with learning management systems
- Offline functionality
- Voice-to-text note taking
- Advanced analytics dashboard