import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { AlertTriangle, Info } from 'lucide-react'

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    buttonVariant: 'danger',
  },
  primary: {
    icon: Info,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    buttonVariant: 'primary',
  },
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) {
  const config = variantConfig[variant] || variantConfig.danger
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={config.buttonVariant} size="sm" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
