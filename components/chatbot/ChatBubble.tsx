'use client'

import React from 'react'

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: Role
  text: string
}

interface ChatBubbleProps {
  message: ChatMessage
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER

  const bubbleClasses = isUser
    ? 'bg-primary text-white rounded-br-none self-end'
    : 'bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-stone-200 rounded-bl-none self-start'
  
  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start'

  return (
    <div className={containerClasses}>
      <div className={`p-3 rounded-2xl max-w-xs md:max-w-sm break-words ${bubbleClasses}`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  )
}
