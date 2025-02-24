import * as React from "react"

export type ToastProps = {
  variant?: "default" | "destructive"
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement<{
  altText: string
}> 