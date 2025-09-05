'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ClientMessage as Message, ClientUser as User } from '~/src/types/shared';

// Message model with receiver relation included
interface MessageWithReceiver extends Message {
  receiver: User;
}

export default function SentMessages() {
  const { data: session } = useSession();
  const [sentMessages, setSentMessages] = useState<MessageWithReceiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/messages/sent');
          if (response.ok) {
            const data: MessageWithReceiver[] = await response.json();
            setSentMessages(data);
          } else {
            const errorData = await response.json();
            setError(errorData.message || '보낸 메시지를 불러오는데 실패했습니다.');
          }
        } catch (err) {
          console.error('Error fetching sent messages:', err);
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
