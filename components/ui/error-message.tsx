import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message: string
  className?: string
  variant?: 'default' | 'destructive'
}

export function ErrorMessage({ message, className, variant = 'destructive' }: ErrorMessageProps) {
  if (!message) return null

  return (
    <Alert variant={variant} className={cn('mt-2', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
