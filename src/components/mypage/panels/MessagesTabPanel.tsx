'use client';

import { useState } from 'react';
import SendMessageForm from '~/src/components/mypage/messages/SendMessageForm';
import SentMessages from '~/src/components/mypage/messages/SentMessages';

export default function MessagesTabPanel() {
  const [messageSentTrigger, setMessageSentTrigger] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <SendMessageForm
        onMessageSent={() => setMessageSentTrigger((p) => p + 1)}
      />
      <div className="mt-8">
        <SentMessages key={messageSentTrigger} />
      </div>
    </div>
  );
}
