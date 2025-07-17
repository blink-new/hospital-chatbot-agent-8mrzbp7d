import { Button } from '@/components/ui/button'
import { Calendar, Phone, Clock, MapPin } from 'lucide-react'

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      id: 'schedule',
      label: 'Schedule Appointment',
      icon: Calendar,
      message: 'I would like to schedule an appointment'
    },
    {
      id: 'emergency',
      label: 'Emergency Info',
      icon: Phone,
      message: 'I need emergency contact information'
    },
    {
      id: 'hours',
      label: 'Hospital Hours',
      icon: Clock,
      message: 'What are the hospital hours?'
    },
    {
      id: 'directions',
      label: 'Directions',
      icon: MapPin,
      message: 'How do I get to the hospital?'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="h-auto p-3 flex flex-col items-center gap-2 text-xs hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all duration-200 hover:shadow-md animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onActionClick(action.message)}
          >
            <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-center leading-tight">{action.label}</span>
          </Button>
        )
      })}
    </div>
  )
}