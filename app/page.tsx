'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, BookOpen, Award, Clock, Copy, CheckCircle2 } from 'lucide-react'
import { getCurrentUser, getCookie, logout } from '@/lib/auth-django'

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attemptHistory, setAttemptHistory] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [testDetails, setTestDetails] = useState<any>(null)

  const checkAuth = async () => {
    const token = getCookie('access_token')
    const testId = process.env.NEXT_PUBLIC_QUIZ_TEST_ID || '1'

    // Fetch Test Details
    try {
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api'}/company/test/${testId}/`)
      if (testResponse.ok) {
        const testData = await testResponse.json()
        setTestDetails(testData)
      }
    } catch (err) {
      console.error('Failed to fetch test details:', err)
    }

    if (token) {
      const djangoUser = await getCurrentUser(token)
      setUser(djangoUser)

      if (djangoUser) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api'}/candidates/submissions/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const responseData = await response.json()
            if (responseData.status && responseData.data) {
              const currentSubmission = responseData.data.find((s: any) => s.test?.id?.toString() === testId || s.id?.toString() === testId) 
              if (currentSubmission) {
                setAttemptHistory({
                  passed: currentSubmission.flag_verification === 'verified',
                  submission_flag: currentSubmission.submitted_flag,
                  score_percentage: null,
                  status: currentSubmission.status
                })
              }
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
            <span className="text-white font-bold text-lg">Skill Hunt Assessments</span>
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {attemptHistory ? (
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Assessment Completed
            </h1>
            <p className="text-xl text-slate-300">
              You have already taken the {testDetails?.job_title || 'Professional Developer'} assessment.
            </p>
            
            <div className="flex justify-center">
              {attemptHistory.passed && attemptHistory.submission_flag ? (
                <Card className="bg-green-900/20 border-green-600 p-8 space-y-6 w-full max-w-md">
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
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700 p-8 space-y-6 w-full max-w-md text-center">
                  <CheckCircle2 className="w-16 h-16 text-blue-400 mx-auto" />
                  <h2 className="text-2xl font-bold text-white">Assessment Recorded</h2>
                  <p className="text-slate-300">
                    Your results have been successfully recorded and sent to the Skill Hunt team for review.
                  </p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                {testDetails?.job_title || 'Professional Developer'} <br/>
                <span className="text-blue-500">Certification Quiz</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                {testDetails?.description || 'Validate your expertise with our industry-leading assessment. Designed for elite developers who want to showcase their technical mastery.'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl mx-auto">
                <div className="flex flex-col items-center gap-2 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <span className="text-white font-semibold">{testDetails?.test_duration_min || 60} Minutes</span>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Time Limit</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  <Award className="w-8 h-8 text-green-400" />
                  <span className="text-white font-semibold">75% Score</span>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Required Pass</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                  <span className="text-white font-semibold">30 Questions</span>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Total Items</span>
                </div>
              </div>

              <div className="space-y-4 w-full">
                <Button
                  onClick={user ? handleStartQuiz : () => router.push('/auth/login')}
                  className="w-full max-w-md py-8 text-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {user ? 'Start Assessment' : 'Sign In to Begin'}
                </Button>
                {!user && (
                  <p className="text-slate-500 text-sm italic">
                    Requires a verified Skill Hunt candidate account.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features / Requirements */}
        <div className="grid md:grid-cols-3 gap-8 py-20 mt-20 border-t border-slate-700/50">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Elite Curriculum</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Questions are curated by industry experts covering TCP/IP, routing, security protocols, and advanced algorithms.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Verified Badge</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upon successful completion, you receive a unique verification flag that can be added to your Skill Hunt profile.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Instant Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get your results immediately. Pass the 75% threshold to achieve certification and unlock elite job opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur py-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-slate-400 font-medium">Skill Hunt Assessments &copy; 2026</p>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            This is an official assessment tool for Skill Hunt candidates. All questions and results are property of Skill Hunt.
          </p>
        </div>
      </footer>
    </div>
  )
}
