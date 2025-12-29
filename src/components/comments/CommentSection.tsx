'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Button from '~/src/components/common/Button';
import Pagination from '~/src/components/common/Pagination';
import { Avatar, AvatarImage, AvatarFallback } from '~/src/components/common/Avatar';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.'),
});
type CommentFormValues = z.infer<typeof commentSchema>;

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
}) => {
  const isAuthor = currentUserId === comment.author.id;

  return (
    <div className="flex space-x-4 py-4 border-b">
      <Avatar size="medium">
        <AvatarImage src={comment.author.image || ''} />
        <AvatarFallback>{comment.author.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{comment.author.name}</span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-800 mt-1">{comment.content}</p>
        {isAuthor && (
          <div className="text-right mt-2">
            <Button
              size="small"
              variant="outlined"
              className="w-auto px-2 py-1 text-xs"
              onClick={() => onDelete(comment.id)}
            >
              삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CommentForm = ({
  routeId,
  onSuccess,
}: {
  routeId: string;
  onSuccess: () => void;
}) => {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  const mutation = useMutation({
    mutationFn: (newComment: CommentFormValues) =>
      fetch(`/api/routes/${routeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      }),
    onSuccess: () => {
      onSuccess();
      form.reset({ content: '' });
    },
    onError: () => {
      alert('댓글 작성에 실패했습니다.');
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="flex items-start space-x-4 mt-6"
    >
      <textarea
        {...form.register('content')}
        className="flex-grow p-2 border rounded-md"
        rows={3}
        placeholder="댓글을 입력하세요..."
      />
      <Button type="submit" className="w-24" disabled={mutation.isPending}>
        {mutation.isPending ? '등록 중...' : '등록'}
      </Button>
    </form>
  );
};

export default function CommentSection({ routeId }: { routeId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: commentData,
    page,
    setPage,
    isLoading,
    isError,
  } = usePaginatedQuery<Comment>({
    queryKey: ['comments', routeId],
    apiEndpoint: `/api/routes/${routeId}/comments`,
    limit: 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      fetch(`/api/routes/${routeId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', routeId] });
    },
    onError: () => {
      alert('댓글 삭제에 실패했습니다.');
    },
  });

  const handleDelete = (commentId: string) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      deleteMutation.mutate(commentId);
    }
  };

  return (
    <div id="comments" className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-4">댓글</h2>
      {session && (
        <CommentForm
          routeId={routeId}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['comments', routeId] })}
        />
      )}
      <div className="mt-6">
        {isLoading && <p>댓글을 불러오는 중...</p>}
        {isError && <p>댓글을 불러오는데 실패했습니다.</p>}
        {commentData?.data && commentData.data.length > 0 ? (
          <>
            {commentData.data.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={session?.user?.id}
                onDelete={handleDelete}
              />
            ))}
            <Pagination
              currentPage={page}
              totalPages={commentData.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          !isLoading && <p className="text-gray-500 py-8 text-center">작성된 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
