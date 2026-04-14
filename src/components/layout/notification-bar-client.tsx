'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function hashMessage(message: string): string {
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(36)
}

export function NotificationBarClient({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(true)
  const storageKey = `notification-dismissed-${hashMessage(message)}`

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(storageKey)
    if (!wasDismissed) {
      setDismissed(false)
    }
  }, [storageKey])

  function handleDismiss() {
    sessionStorage.setItem(storageKey, '1')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="relative flex items-center justify-center bg-[var(--accent-orange)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)]">
            <span className="text-center pr-8">{message}</span>
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-black/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
