import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import {
  getCommentsByRouteId,
  createComment,
} from '~/src/services/comment/commentService';
import { z } from 'zod';

const searchParamsSchema = z.object({
  page: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(1),
  ),
  limit: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(1).default(10),
  ),
});

export async function GET(
  request: NextRequest,
  { params: awaitedParams }: { params: { routeId: string } },
) {
  try {
    const params = await awaitedParams;
    const { searchParams } = new URL(request.url);
    const { page, limit } = searchParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const { routeId } = params;

    const data = await getCommentsByRouteId({ routeId, page, limit });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid query parameters' }, { status: 400 });
    }
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

const postBodySchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty.'),
});

export async function POST(
  request: NextRequest,
  { params: awaitedParams }: { params: { routeId: string } },
) {
  const params = await awaitedParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = postBodySchema.parse(body);
    const { routeId } = params;
    const authorId = session.user.id;

    const newComment = await createComment({ routeId, authorId, content });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
