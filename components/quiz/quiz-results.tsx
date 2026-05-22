'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Copy, LogOut } from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/lib/auth-django'

interface QuizResultsProps {
  score: number
  totalQuestions: number
  correctAnswers: number
  submissionFlag: string | null
  attemptId?: string
}

export function QuizResults({
  score,
  totalQuestions,
  correctAnswers,
  submissionFlag,
  attemptId,
}: QuizResultsProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const passed = score >= 75
  const percentage = Math.round(score)

  const handleCopyFlag = () => {
    if (submissionFlag) {
      navigator.clipboard.writeText(submissionFlag)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className={`mb-6 p-8 border-2 ${passed ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>

            <div>
              <h1 className={`text-4xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {passed ? 'Congratulations!' : 'Quiz Complete'}
              </h1>
              <p className="text-slate-300">
                {passed
                  ? 'You have successfully passed the professional developer certification quiz!'
                  : 'You did not meet the passing score. Please review and try again.'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Your Score</p>
                  <p className={`text-3xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                    {percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Correct Answers</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Passing Score</p>
                  <p className="text-3xl font-bold text-slate-300">75%</p>
                </div>
              </div>

              {passed && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 text-sm mb-3">Submission Flag:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-slate-900 p-3 rounded text-green-400 text-sm font-mono break-all">
                      {submissionFlag}
                    </code>
                    <Button
                      onClick={handleCopyFlag}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Go to Home
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-3">Quiz Summary</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>Total Questions: <span className="text-slate-200 font-medium">{totalQuestions}</span></p>
            <p>Questions Answered Correctly: <span className="text-green-400 font-medium">{correctAnswers}</span></p>
            <p>Questions Answered Incorrectly: <span className="text-red-400 font-medium">{totalQuestions - correctAnswers}</span></p>
            <p>Required Score: <span className="text-slate-200 font-medium">75% (22 questions)</span></p>
            <p>Your Score: <span className={`font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>{percentage}%</span></p>
            <p>Status: <span className={`font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>{passed ? 'PASSED' : 'FAILED'}</span></p>
          </div>
        </Card>
      </div>
    </div>
  )
}
