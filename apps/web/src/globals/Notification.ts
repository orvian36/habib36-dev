import type { GlobalConfig } from 'payload'

export const Notification: GlobalConfig = {
  slug: 'notification',
  label: 'Notification Banner',
  admin: {
    description: 'Controls the dismissible notification bar shown at the top of every page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'message',
      type: 'text',
      required: true,
      label: 'Message',
      admin: {
        description: 'The text displayed in the notification banner.',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: false,
      label: 'Visible',
      admin: {
        description: 'Toggle to show or hide the banner on the site.',
      },
    },
  ],
}
