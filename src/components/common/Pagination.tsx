'use client';

import { cn } from '~/src/utils/class-name';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const pagesPerBlock = 5; // 한 블록당 보여줄 페이지 수

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const currentBlock = Math.ceil(currentPage / pagesPerBlock);
  const startPage = (currentBlock - 1) * pagesPerBlock + 1;
  const endPage = Math.min(startPage + pagesPerBlock - 1, totalPages);

  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const hasPrevBlock = currentBlock > 1;
  const hasNextBlock = endPage < totalPages;

  return (
    <nav className="flex justify-center my-8">
      <ul className="flex items-center -space-x-px h-10 text-base">
        {/* 이전 블록으로 이동 버튼 */}
        {hasPrevBlock && (
          <li>
            <button
              onClick={() => onPageChange(startPage - 1)}
              className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="이전 블록으로 이동"
            >
              <span className="sr-only">Previous Block</span>
              &laquo;&laquo;
            </button>
          </li>
        )}

        {/* 이전 페이지로 이동 버튼 */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
              !hasPrevBlock ? "rounded-s-lg" : "" // Apply rounded-s-lg if no prev block button
            )}
            aria-label="이전 페이지로 이동"
          >
            <span className="sr-only">Previous</span>
            &laquo;
          </button>
        </li>

        {/* 페이지 번호들 */}
        {visiblePages.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={cn(
                'flex items-center justify-center px-4 h-10 leading-tight border border-gray-300',
                currentPage === page
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              {page}
            </button>
          </li>
        ))}

        {/* 다음 페이지로 이동 버튼 */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
              !hasNextBlock ? "rounded-e-lg" : "" // Apply rounded-e-lg if no next block button
            )}
            aria-label="다음 페이지로 이동"
          >
            <span className="sr-only">Next</span>
            &raquo;
          </button>
        </li>

        {/* 다음 블록으로 이동 버튼 */}
        {hasNextBlock && (
          <li>
            <button
              onClick={() => onPageChange(endPage + 1)}
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="다음 블록으로 이동"
            >
              <span className="sr-only">Next Block</span>
              &raquo;&raquo;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}