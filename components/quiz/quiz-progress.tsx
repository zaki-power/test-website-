import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface QuizProgressProps {
  current: number
  total: number
  answered: number
}

export function QuizProgress({ current, total, answered }: QuizProgressProps) {
  const progressPercent = (current / total) * 100
  const answerPercent = (answered / total) * 100

  return (
    <Card className="mb-6 bg-slate-800 border-slate-700 p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Question {current} of {total}</h2>
          <span className="text-slate-400 text-sm">{answered} answered</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-slate-400">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="bg-slate-700 h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Answers Completed</span>
            <span className="text-slate-400">{answered}/{total}</span>
          </div>
          <Progress value={answerPercent} className="bg-slate-700 h-2" />
        </div>

        <div className="pt-2 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            You need <span className="text-green-400 font-bold">75% (22/30 questions)</span> to pass and receive the submission flag.
          </p>
        </div>
      </div>
    </Card>
  )
}
