import { useEffect } from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '~/src/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
};

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const isDark = context.globals?.theme === 'dark';

      useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
      }, [isDark]);

      return (
        <Provider>
          <QueryClientProvider client={queryClient}>
            <div className={isDark ? 'bg-gray-900 p-6 min-h-screen' : 'bg-white p-6 min-h-screen'}>
              <Story />
            </div>
          </QueryClientProvider>
        </Provider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'fullscreen',
  },
};

export default preview;
