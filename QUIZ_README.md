# Professional Developer Certification Quiz

A comprehensive professional-grade certification quiz application built with Next.js 16, Supabase, and modern web technologies.

## Overview

This is a secure, database-backed quiz platform with:
- **30 challenging networking and developer questions** - CCNA-level difficulty
- **75% pass requirement** - Users must answer 22+ questions correctly to pass
- **Submission flag rewards** - Passing users receive a unique submission flag
- **Authentication system** - Secure user accounts with Supabase Auth
- **Complete scoring and tracking** - All attempts are stored with detailed analytics
- **Professional UI** - Dark mode tech aesthetic with responsive design

## Features

### 1. Authentication System
- User registration with email and password
- Email confirmation (required before taking quiz)
- Secure login/logout
- User session management via Supabase Auth

### 2. Quiz Interface
- Clean, professional dark-mode design
- One question per screen with A/B/C/D options
- Real-time progress tracking
- Answer review before submission
- Navigation between questions (Previous/Next)
- Instant scoring on submission

### 3. Scoring System
- Automatic score calculation
- Pass/Fail determination (75% threshold = 22/30 questions)
- Submission flag generation on passing
- Duration tracking
- Complete answer history storage

### 4. Database Schema
- **questions table** - 30 pre-loaded questions with difficulty levels
- **quiz_attempts table** - All quiz submissions with scores and flags
- **user_answers table** - Individual answer tracking for analytics
- **Row-Level Security (RLS)** - Users can only see their own data

## Quiz Questions

All 30 questions cover:
- OSI Model layers and protocols
- TCP/IP networking fundamentals
- Routing protocols (OSPF, BGP, RIP)
- IP addressing and subnetting
- VLAN configuration
- DNS, DHCP, ARP
- HTTP status codes
- TCP/UDP differences
- TLS encryption and security
- Network security concepts (NAT, SYN floods, DDoS)
- QoS and traffic management

### Difficulty Levels:
- Level 1: Foundational (5 questions)
- Level 2: Intermediate (10 questions)
- Level 3: Advanced (10 questions)
- Level 4: Expert (5 questions)

## Getting Started

### Prerequisites
- Supabase project (free tier works)
- Environment variables configured

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Installation
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Flow

1. **Homepage** - View quiz details and requirements
2. **Sign Up** - Create account and confirm email
3. **Login** - Authenticate to access the quiz
4. **Quiz Interface** - Answer 30 questions at your own pace
5. **Results Screen** - View score, pass/fail status, and submission flag if passing

## API Routes

### Quiz Endpoints
- `POST /api/quiz/submit` - Submit completed quiz
- `GET /api/quiz/questions` - Fetch all questions
- `GET /api/quiz/attempts` - Get user's attempt history

### Auth Endpoints
- `POST /auth/callback` - OAuth/email callback handler
- `POST /auth/logout` - Sign out user

## Passing Criteria

- **Minimum Score**: 75% (22 out of 30 questions)
- **Submission Flag Format**: `FLAG{CERTIFIED_timestamp_userid}`
- **Certificate**: Unique flag issued upon passing

## Database Operations

### Creating a New Attempt
```sql
INSERT INTO quiz_attempts (user_id, total_questions, correct_answers, score_percentage, passed, submission_flag)
VALUES (...) RETURNING id;
```

### Storing Answers
```sql
INSERT INTO user_answers (attempt_id, question_id, user_answer, is_correct)
VALUES (...);
```

### Retrieving User Results
```sql
SELECT * FROM quiz_attempts WHERE user_id = auth.uid() ORDER BY created_at DESC;
```

## Security Features

- **Row-Level Security (RLS)** - All tables protected with user-specific policies
- **Secure Authentication** - Email/password via Supabase Auth
- **Data Encryption** - Supabase provides encrypted connections
- **Session Management** - Automatic token refresh via middleware
- **Input Validation** - TypeScript types ensure data integrity

## File Structure

```
app/
  ├── page.tsx                 # Homepage
  ├── layout.tsx              # Root layout
  ├── auth/
  │   ├── login/page.tsx
  │   ├── sign-up/page.tsx
  │   ├── sign-up-success/page.tsx
  │   └── callback/route.ts    # Auth callback
  └── quiz/
      └── page.tsx             # Quiz interface

components/
  └── quiz/
      ├── quiz-container.tsx   # Main quiz logic
      ├── question-card.tsx    # Question display
      ├── quiz-progress.tsx    # Progress bar
      ├── quiz-results.tsx     # Results screen
      └── loading-spinner.tsx  # Loading state

lib/
  └── supabase/
      ├── client.ts           # Browser client
      ├── server.ts           # Server client
      └── proxy.ts            # Session proxy

middleware.ts                  # Session refresh handler
```

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Handling**: React Hook Form, Zod
- **Icons**: Lucide React
- **Components**: shadcn/ui

## Performance Optimizations

- Server-side rendering for initial page load
- Client-side question pre-loading
- Efficient database queries with RLS
- CSS-in-JS for style optimization
- Responsive design for all devices

## Testing the Quiz

### Quick Test Path
1. Navigate to homepage
2. Click "Create Account"
3. Sign up with test email
4. Confirm email (check inbox or Supabase dashboard)
5. Login
6. Start quiz
7. Answer all 30 questions
8. Submit and view results

### Test Credentials
You can use the Supabase dashboard to create test users and bypass email confirmation if needed.

## Support & Troubleshooting

### Common Issues

**"Email not confirmed"**
- Check your email inbox for confirmation link
- In Supabase dashboard, go to Auth → Users and manually confirm

**"Database connection error"**
- Verify environment variables are set correctly
- Check Supabase project status in dashboard
- Ensure RLS policies are enabled

**"Questions not loading"**
- Verify `questions` table exists in Supabase
- Check that RLS policy allows SELECT for authenticated users
- Ensure 30 questions were inserted during setup

## Future Enhancements

- Leaderboard system
- Question explanations for incorrect answers
- Timed quiz mode
- Category-specific quizzes
- Admin dashboard for question management
- Certificate download feature
- Attempt analytics and performance tracking

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: Production Ready
