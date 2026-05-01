import { sendInternalNotification } from '@/lib/internal-notifications'

export async function trySendInternalNotification(
  ...args: Parameters<typeof sendInternalNotification>
) {
  try {
    await sendInternalNotification(...args)
  } catch (error) {
    console.error('Internal notification error:', error)
  }
}