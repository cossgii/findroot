'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ClientMessage as Message,
  ClientUser as User,
} from '~/src/types/shared';

interface MessageWithRelations extends Message {
  sender: User;
  receiver: User;
}

export default function MessageInbox() {
  const { data: session } = useSession();
  const [receivedMessages, setReceivedMessages] = useState<
    MessageWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/messages/inbox');
          if (response.ok) {
            const data: MessageWithRelations[] = await response.json();
            setReceivedMessages(data);
          } else {
            const errorData = await response.json();
            setError(errorData.message || '메시지를 불러오는데 실패했습니다.');
          }
        } catch (err) {
          console.error('Error fetching received messages:', err);
          setError('네트워크 오류 또는 서버 문제');
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [session]);

  if (loading) {
    return <div className="text-center py-4">메시지 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">받은 메시지함</h3>
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
              {message.isRead ? ' (읽음)' : ' (안 읽음)'}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
