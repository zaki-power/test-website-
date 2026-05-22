import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

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

interface QuestionCardProps {
  question: Question
  selectedAnswer?: string
  onAnswerChange: (answer: string) => void
}

export function QuestionCard({ question, selectedAnswer, onAnswerChange }: QuestionCardProps) {
  const options = [
    { value: 'A', label: question.option_a },
    { value: 'B', label: question.option_b },
    { value: 'C', label: question.option_c },
    { value: 'D', label: question.option_d },
  ]

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {question.question_text}
          </h3>
          <p className="text-slate-400 text-sm">Select one answer</p>
        </div>

        <RadioGroup value={selectedAnswer || ''} onValueChange={onAnswerChange}>
          <div className="space-y-3">
            {options.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                <RadioGroupItem
                  value={option.value}
                  id={`option-${option.value}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="flex-1 cursor-pointer text-slate-200"
                >
                  <span className="font-semibold text-blue-400">{option.value}.</span>{' '}
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
    </Card>
  )
}
