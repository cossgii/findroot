import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import {
  updateComment,
  deleteComment,
} from '~/src/services/comment/commentService';
import { z } from 'zod';

const putBodySchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty.'),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = putBodySchema.parse(body);
    const { commentId } = params;
    const userId = session.user.id;

    const updatedComment = await updateComment({ commentId, userId, content });

    return NextResponse.json(updatedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { commentId } = params;
    const userId = session.user.id;

    await deleteComment({ commentId, userId });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
