'use client';

import { cn } from '~/src/utils/class-name';

export type MyPageTab = 'profile' | 'content' | 'likes' | 'messages';

interface MyPageTabsProps {
  activeTab: MyPageTab;
  setActiveTab: (tab: MyPageTab) => void;
}

const tabs: { id: MyPageTab; label: string }[] = [
  { id: 'profile', label: '프로필' },
  { id: 'content', label: '내 콘텐츠' },
  { id: 'likes', label: '좋아요' },
  { id: 'messages', label: '문의하기' },
];

export default function MyPageTabs({ activeTab, setActiveTab }: MyPageTabsProps) {
  return (
    <div className="w-full border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
