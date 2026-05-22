'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, BookOpen, Award, Clock, Copy, CheckCircle2 } from 'lucide-react'
import { SignInForm } from '@/components/auth/sign-in-form'
import { getCurrentUser, getCookie, logout } from '@/lib/auth-django'

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attemptHistory, setAttemptHistory] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const checkAuth = async () => {
    const token = getCookie('access_token')
    if (token) {
      const djangoUser = await getCurrentUser(token)
      setUser(djangoUser)

      if (djangoUser) {
        // Fetch submissions from Django backend
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api'}/candidates/submissions/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const submissions = await response.json()
            // For now, if there's any submission, we consider it "completed"
            // In a real app, we'd filter by the specific test_id for this quiz
            if (submissions && submissions.length > 0) {
              const lastSubmission = submissions[submissions.length - 1]
              setAttemptHistory({
                passed: lastSubmission.flag_verification === 'verified',
                submission_flag: lastSubmission.submitted_flag,
                // Score is not available in Django Submission model, so we use dummy data or hide it
                score_percentage: 0, 
                correct_answers: 0,
                total_questions: 30,
              })
            }
          }
        } catch (err) {
          console.error('Failed to fetch submissions:', err)
        }
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleStartQuiz = () => {
    router.push('/quiz')
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setAttemptHistory(null)
    router.refresh()
  }

  const handleSignInSuccess = async () => {
    setRefreshing(true)
    await checkAuth()
    setRefreshing(false)
  }

  const handleCopyFlag = () => {
    if (attemptHistory?.submission_flag) {
      navigator.clipboard.writeText(attemptHistory.submission_flag)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-white font-bold text-lg">Dev Cert</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-slate-300 text-sm">{user.user.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Show different content based on authentication and completion status */}
        {!user ? (
          // Not logged in - show sign-in form
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Professional Developer <span className="text-blue-400">Certification Quiz</span>
              </h1>
              <p className="text-xl text-slate-300">
                Test your networking and development expertise with 30 challenging questions covering advanced concepts in CCNA-level networking, TCP/IP protocols, routing, and security.
              </p>
              <div className="space-y-3 mt-6">
                <p className="text-slate-400 text-sm font-medium">Required Score: 75% (22 out of 30 questions)</p>
                <p className="text-slate-400 text-sm font-medium">Time Limit: 60 minutes</p>
                <p className="text-slate-400 text-sm font-medium">Important: You can take this test only once. Make sure you are ready before starting.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
              <SignInForm onSignInSuccess={handleSignInSuccess} />
            </div>
          </div>
        ) : attemptHistory ? (
          // Logged in and already completed quiz
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-white leading-tight">
                You&apos;ve Already Completed the Quiz
              </h1>
              <p className="text-xl text-slate-300">
                Thank you for taking our professional developer certification quiz. Your results are final and you cannot retake the test.
              </p>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                <p className="text-slate-400 text-sm">
                  <span className="font-semibold">Score:</span> {attemptHistory.score_percentage}%
                </p>
                <p className="text-slate-400 text-sm">
                  <span className="font-semibold">Correct Answers:</span> {attemptHistory.correct_answers} / {attemptHistory.total_questions}
                </p>
                <p className="text-slate-400 text-sm">
                  <span className="font-semibold">Status:</span> {attemptHistory.passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur-2xl opacity-20"></div>
              {attemptHistory.passed && attemptHistory.submission_flag ? (
                <Card className="relative bg-green-900/20 border-green-600 p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Certification Achieved</h2>
                  </div>

                  <div className="space-y-3">
                    <p className="text-slate-300 text-center">Your submission flag:</p>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                      <p className="text-green-400 font-mono text-sm break-all">{attemptHistory.submission_flag}</p>
                    </div>
                    <Button
                      onClick={handleCopyFlag}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Flag'}
                    </Button>
                  </div>

                  <p className="text-sm text-slate-400 text-center">
                    This flag is unique to your account and will be displayed only this one time.
                  </p>
                </Card>
              ) : (
                <Card className="relative bg-red-900/20 border-red-600 p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-16 h-16 text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Score Below Passing</h2>
                  </div>
                  <p className="text-slate-300 text-center">
                    Your score of {attemptHistory.score_percentage}% is below the required 75% passing grade. Unfortunately, you cannot retake the test.
                  </p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Logged in but haven't taken quiz yet
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Ready to Test Your <span className="text-blue-400">Expertise?</span>
              </h1>
              <p className="text-xl text-slate-300">
                Test your networking and development expertise with 30 challenging questions covering advanced concepts in CCNA-level networking, TCP/IP protocols, routing, and security.
              </p>
              <div className="space-y-3 mt-6">
                <p className="text-slate-400 text-sm font-medium">Required Score: 75% (22 out of 30 questions)</p>
                <p className="text-slate-400 text-sm font-medium">Time Limit: 60 minutes</p>
                <p className="text-slate-400 text-sm font-medium text-orange-400">Important: You can take this test only once. Make sure you are ready before starting.</p>
              </div>
              <Button
                onClick={handleStartQuiz}
                className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Test Now
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
              <Card className="relative bg-slate-800 border-slate-700 p-8 space-y-6">
                <div className="text-center pb-4 border-b border-slate-700">
                  <h2 className="text-3xl font-bold text-white">Quiz Details</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <BookOpen className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Total Questions</p>
                      <p className="text-white font-semibold text-lg">30 challenging questions</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Passing Score</p>
                      <p className="text-white font-semibold text-lg">75% (22 questions)</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Clock className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Estimated Duration</p>
                      <p className="text-white font-semibold text-lg">45-60 minutes</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-slate-400 text-sm">Pass Reward</p>
                      <p className="text-white font-semibold text-lg">Submission Flag (One-time display)</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-16 border-t border-slate-700">
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Comprehensive Content</h3>
            <p className="text-slate-400 text-sm">
              Questions cover networking protocols, routing algorithms, security concepts, and modern development standards.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Professional Assessment</h3>
            <p className="text-slate-400 text-sm">
              Difficulty level equivalent to CCNA certification exams with real-world networking scenarios.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Verification</h3>
            <p className="text-slate-400 text-sm">
              Receive a unique submission flag immediately upon passing to verify your certification.
            </p>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Professional Developer Certification Quiz • Test Your Knowledge Today</p>
        </div>
      </div>
    </div>
  )
}
