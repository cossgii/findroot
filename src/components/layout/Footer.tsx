'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <footer className="text-black text-center p-4 text-sm flex-shrink-0">
      <p>&copy; 2026 FindRoot. All rights reserved.</p>
      <p>
        Contact:{' '}
        <a
          href="https://github.com/cossgii/findroot/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          GitHub Issues
        </a>
      </p>
    </footer>
  );
}
