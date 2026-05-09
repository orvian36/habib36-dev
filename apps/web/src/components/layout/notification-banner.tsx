import { getPayloadClient } from '@/lib/payload'
import { NotificationBarClient } from './notification-bar-client'

export async function NotificationBanner() {
  try {
    const payload = await getPayloadClient()
    const notification = await payload.findGlobal({ slug: 'notification' })

    if (!notification.visible || !notification.message) {
      return null
    }

    return <NotificationBarClient message={notification.message} />
  } catch {
    return null
  }
}
