export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "received";

export type Message = {
  id: string
  whatsappMessageId?: string
  text: string
  time: string
  direction: 'incoming' | 'outgoing'
  status?: MessageStatus
}

export type Conversation = {
  id: string
  name: string
  phone: string
  initials: string
  avatarTone: string
  lastMessage: string
  timestamp: string
  unread: number
  online?: boolean
  messages: Message[]
}

export const conversations: Conversation[] = [
  {
    id: 'sophia',
    name: 'Sophia Miller',
    phone: '+1 (415) 555-0138',
    initials: 'SM',
    avatarTone: 'bg-emerald-100 text-emerald-700',
    lastMessage: 'That sounds perfect, thank you!',
    timestamp: '10:42 AM',
    unread: 2,
    online: true,
    messages: [
      { id: 's1', text: 'Hi there! I had a question about my recent order.', time: '10:35 AM', direction: 'incoming' },
      { id: 's2', text: 'Of course — I can help with that. Could you share your order number?', time: '10:37 AM', direction: 'outgoing', status: 'read' },
      { id: 's3', text: 'It is #WB-2048. I need to update the delivery address.', time: '10:40 AM', direction: 'incoming' },
      { id: 's4', text: 'That sounds perfect, thank you!', time: '10:42 AM', direction: 'incoming' },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    phone: '+1 (212) 555-0191',
    initials: 'MJ',
    avatarTone: 'bg-sky-100 text-sky-700',
    lastMessage: 'I’ll send those over shortly.',
    timestamp: '9:18 AM',
    unread: 0,
    messages: [{ id: 'm1', text: 'I’ll send those over shortly.', time: '9:18 AM', direction: 'incoming' }],
  },
  {
    id: 'olivia',
    name: 'Olivia Chen',
    phone: '+1 (646) 555-0166',
    initials: 'OC',
    avatarTone: 'bg-violet-100 text-violet-700',
    lastMessage: 'Can we move our call to Thursday?',
    timestamp: 'Yesterday',
    unread: 1,
    messages: [{ id: 'o1', text: 'Can we move our call to Thursday?', time: 'Yesterday', direction: 'incoming' }],
  },
  {
    id: 'noah',
    name: 'Noah Williams',
    phone: '+1 (305) 555-0112',
    initials: 'NW',
    avatarTone: 'bg-amber-100 text-amber-700',
    lastMessage: 'Thanks for the quick update.',
    timestamp: 'Yesterday',
    unread: 0,
    messages: [{ id: 'n1', text: 'Thanks for the quick update.', time: 'Yesterday', direction: 'incoming' }],
  },
  {
    id: 'ava',
    name: 'Ava Thompson',
    phone: '+1 (310) 555-0180',
    initials: 'AT',
    avatarTone: 'bg-rose-100 text-rose-700',
    lastMessage: 'The team is looking forward to it.',
    timestamp: 'Mon',
    unread: 0,
    messages: [{ id: 'a1', text: 'The team is looking forward to it.', time: 'Mon', direction: 'incoming' }],
  },
]