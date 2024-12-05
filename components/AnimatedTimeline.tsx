import { cn } from "@/lib/utils"
import { ArrowRight } from 'lucide-react'

interface TimelineStep {
  label: string
  isActive: boolean
}

interface AnimatedTimelineProps {
  steps: TimelineStep[]
}

export function AnimatedTimeline({ steps }: AnimatedTimelineProps) {
  return (
    <div className="mb-8 flex items-center justify-center space-x-4" role="navigation" aria-label="Process Timeline">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div 
            className="relative flex h-12 w-40 items-center justify-center rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white"
            role="listitem"
            aria-label={`Step ${index + 1}: ${step.label}`}
          >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent opacity-20" style={{ backgroundSize: '200% 100%' }} />
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className="ml-4 h-6 w-6 text-indigo-600" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}

