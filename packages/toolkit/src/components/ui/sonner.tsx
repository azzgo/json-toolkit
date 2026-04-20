import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast, useSonner } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { toasts } = useSonner()

  const handleToastClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const isInteractiveChild = target.closest("button, a, [data-button], [data-close-button], [data-cancel]")
    if (isInteractiveChild) {
      return
    }

    const toastElement = target.closest<HTMLElement>("[data-sonner-toast]")
    if (!toastElement) {
      return
    }

    const indexValue = toastElement.getAttribute("data-index")
    if (!indexValue) {
      return
    }

    const index = Number(indexValue)
    if (Number.isNaN(index)) {
      return
    }

    const activeToasts = toasts.filter((item) => !item.position || item.position === props.position)
    const clickedToast = activeToasts[index]

    if (clickedToast) {
      toast.dismiss(clickedToast.id)
    }
  }

  return (
    <div onClick={handleToastClick}>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  )
}

export { Toaster }
