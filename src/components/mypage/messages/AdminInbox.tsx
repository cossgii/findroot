'use client';

import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClientMessage as Message, ClientUser as User } from '~/src/types/shared';

interface MessageWithRelations extends Message {
  sender: User;
  receiver: User;
}

const fetchAdminMessages = async (): Promise<MessageWithRelations[]> => {
  const response = await fetch('/api/admin/messages');
  if (response.status === 401) {
    throw new Error('관리자만 접근할 수 있습니다.');
  }
  if (!response.ok) {
    throw new Error('메시지를 불러오는데 실패했습니다.');
  }
  return response.json();
};

export default function AdminInbox() {
  const { data: receivedMessages } = useSuspenseQuery<MessageWithRelations[]>({
    queryKey: ['messages', 'admin', 'inbox'],
    queryFn: fetchAdminMessages,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">관리자 메시지 함</h3>
      {receivedMessages.length === 0 ? (
        <p className="text-gray-500">받은 메시지가 없습니다.</p>
      ) : (
        receivedMessages.map((message) => (
          <div
            key={message.id}
            className="bg-gray-100 p-4 rounded-lg shadow-sm"
          >
            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                {message.sender.name || '익명'}
              </span>{' '}
              님으로부터
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
