'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Account Created Successfully!</CardTitle>
          <CardDescription className="text-slate-400">Please check your email to confirm your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm text-center">
              We&apos;ve sent you a confirmation email. Click the link in the email to activate your account, then you can sign in and begin the quiz.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href="/auth/login">Return to Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
