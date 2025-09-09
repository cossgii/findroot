'use client';

import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import SendMessageForm from '~/src/components/mypage/messages/SendMessageForm';
import SentMessages from '~/src/components/mypage/messages/SentMessages';
import AdminInbox from '~/src/components/mypage/messages/AdminInbox';
import MessageListItemSkeleton from '~/src/components/mypage/messages/MessageListItemSkeleton';

const MessagesSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
    <MessageListItemSkeleton />
    <MessageListItemSkeleton />
    <MessageListItemSkeleton />
  </div>
);

export default function MessagesTabPanel() {
  const { data: session } = useSession();
  const [messageSentTrigger, setMessageSentTrigger] = useState(0);

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p>콘텐츠를 보려면 로그인해주세요.</p>
      </div>
    );
  }

  if (session.user.isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Suspense fallback={<MessagesSkeleton />}>
          <AdminInbox />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <SendMessageForm
        onMessageSent={() => setMessageSentTrigger((p) => p + 1)}
      />
      <div className="mt-8">
        <Suspense fallback={<MessagesSkeleton />}>
          <SentMessages key={messageSentTrigger} />
        </Suspense>
      </div>
    </div>
  );
}
