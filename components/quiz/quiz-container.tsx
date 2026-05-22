'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QuestionCard } from './question-card'
import { QuizProgress } from './quiz-progress'
import { QuizResults } from './quiz-results'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Question {
  id: string
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, string>
  submitted: boolean
  startTime: number
  score?: number
  attemptId?: string
}

export function QuizContainer({ userId }: { userId: string }) {
  const supabase = createClient()
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    submitted: false,
    startTime: Date.now(),
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('question_number', { ascending: true })

        if (error) throw error
        setQuestions(data || [])
      } catch (err) {
        setError('Failed to load questions')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [supabase])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }))
  }

  const handleNext = () => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }))
    }
  }

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }))
    }
  }

  const handleSubmit = async () => {
    const endTime = Date.now()
    const durationSeconds = Math.floor((endTime - quizState.startTime) / 1000)

    // Calculate score
    let correctCount = 0
    questions.forEach((question) => {
      if (quizState.answers[question.id] === question.correct_answer) {
        correctCount++
      }
    })

    const percentage = (correctCount / questions.length) * 100
    const passed = percentage >= 75

    // 1. Fetch Flag from Django Backend (to display to user)
    let finalFlag = null
    const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1]
    
    if (token && passed) {
      try {
        const testId = process.env.NEXT_PUBLIC_QUIZ_TEST_ID || '1'
        
        // Fetch the official flag for this test from the backend
        const flagResponse = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api'}/candidates/test/${testId}/flag/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (flagResponse.ok) {
          const flagData = await flagResponse.json()
          finalFlag = flagData.data.submission_flag
          // Note: We are NOT automatically creating a submission record here.
          // The user must take this flag and submit it manually in the portal.
        }
      } catch (djangoErr) {
        console.error('Failed to fetch flag from Django:', djangoErr)
      }
    }

    // If we couldn't get the official flag, fallback to a generated one for display only
    const displayFlag = finalFlag || (passed ? `FLAG{CERTIFIED_${Date.now()}_${userId.slice(0, 8)}}` : null)

    try {
      // 2. Save attempt to Supabase (if possible/needed for detailed history)
      let attemptId = ''
      try {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: userId,
            total_questions: questions.length,
            correct_answers: correctCount,
            score_percentage: percentage,
            passed,
            submission_flag: displayFlag,
            attempt_duration_seconds: durationSeconds,
          })
          .select()
          .single()

        if (!attemptError && attemptData) {
          attemptId = attemptData.id
          // Save individual answers
          const answerPromises = questions.map((question) => {
            const userAnswer = quizState.answers[question.id]
            return supabase.from('user_answers').insert({
              attempt_id: attemptData.id,
              question_id: question.id,
              user_answer: userAnswer || null,
              is_correct: userAnswer === question.correct_answer,
            })
          })
          await Promise.all(answerPromises)
        }
      } catch (supabaseErr) {
        console.error('Failed to save to Supabase:', supabaseErr)
      }

      setQuizState((prev) => ({
        ...prev,
        submitted: true,
        score: percentage,
        attemptId: attemptId,
        displayFlag: displayFlag, // Store for results display
      }))
    } catch (err) {
      setError('Failed to submit quiz')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading questions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-red-900/20 border-red-700">
          <div className="p-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-red-400 mb-1">Error</h2>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (quizState.submitted) {
    return (
      <QuizResults
        score={quizState.score || 0}
        totalQuestions={questions.length}
        correctAnswers={Object.values(quizState.answers).filter(
          (answer, idx) => answer === questions[idx]?.correct_answer
        ).length}
        submissionFlag={(quizState as any).displayFlag}
        attemptId={quizState.attemptId}
      />
    )
  }

  const currentQuestion = questions[quizState.currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <QuizProgress
          current={quizState.currentQuestionIndex + 1}
          total={questions.length}
          answered={Object.keys(quizState.answers).length}
        />

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={quizState.answers[currentQuestion.id]}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />
        )}

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handlePrevious}
            disabled={quizState.currentQuestionIndex === 0}
            variant="outline"
            className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            Previous
          </Button>

          {quizState.currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
