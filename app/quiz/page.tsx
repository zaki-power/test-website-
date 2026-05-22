'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizContainer } from '@/components/quiz/quiz-container'
import { LoadingSpinner } from '@/components/quiz/loading-spinner'
import { getCurrentUser, getCookie } from '@/lib/auth-django'

export default function QuizPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('access_token')
      if (!token) {
        router.push('/')
        return
      }

      const djangoUser = await getCurrentUser(token)
      if (!djangoUser) {
        router.push('/')
        return
      }

      // Check if user has already completed the quiz via Django submissions
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api'}/candidates/submissions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const submissions = await response.json()
          if (submissions && submissions.length > 0) {
            // User has already taken a quiz, redirect to home
            router.push('/')
            return
          }
        }
      } catch (err) {
        console.error('Failed to check submissions:', err)
      }

      setUser(djangoUser.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return <QuizContainer userId={user.id.toString()} />
}
