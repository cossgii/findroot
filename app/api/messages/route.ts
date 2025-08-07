import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/src/services/auth/authOptions';
import { sendMessage } from '~/src/services/message/messageService';
import { z } from 'zod';
import { MAIN_ACCOUNT_ID } from '~/app/api/signup/route'; // MAIN_ACCOUNT_ID 가져오기

const messageSchema = z.object({
  content: z.string().min(1, { message: '메시지 내용을 입력해주세요.' }),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    const newMessage = await sendMessage(
      session.user.id, // senderId는 현재 로그인한 사용자
      MAIN_ACCOUNT_ID, // receiverId를 MAIN_ACCOUNT_ID로 고정
      validatedData.content,
    );

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: error.errors },
        { status: 400 },
      );
    }
    console.error('Error sending message:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
