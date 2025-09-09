'use client';

import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClientMessage as Message, ClientUser as User } from '~/src/types/shared';

interface MessageWithReceiver extends Message {
  receiver: User;
}

const fetchSentMessages = async (): Promise<MessageWithReceiver[]> => {
  const response = await fetch('/api/messages/sent');
  if (!response.ok) {
    throw new Error('보낸 메시지를 불러오는데 실패했습니다.');
  }
  return response.json();
};

export default function SentMessages() {
  const { data: sentMessages } = useSuspenseQuery<MessageWithReceiver[]>({
    queryKey: ['messages', 'sent'],
    queryFn: fetchSentMessages,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">내가 보낸 문의 내역</h3>
      {sentMessages.length === 0 ? (
        <p className="text-gray-500">보낸 메시지가 없습니다.</p>
      ) : (
        sentMessages.map((message) => (
          <div
            key={message.id}
            className="bg-gray-100 p-4 rounded-lg shadow-sm"
          >
            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                To: {message.receiver.name || '알 수 없음'}
              </span>
            </p>
            <p className="mt-1 text-gray-800">{message.content}</p>
            <p className="text-xs text-gray-500 text-right mt-2">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
