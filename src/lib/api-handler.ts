import { getServerSession, type Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodType } from 'zod';
import { authOptions } from '~/src/services/auth/authOptions';

export const apiSuccess = <T>(data: T, status = 200): NextResponse<T> => {
  return NextResponse.json(data, { status });
};

export const apiError = (
  message: string,
  status = 500,
): NextResponse<{ message: string }> => {
  return NextResponse.json({ message }, { status });
};

interface HandlerParams<TBody, TQuery> {
  req: NextRequest;
  params: Record<string, string>;
  session: Session | null;
  body: TBody;
  query: TQuery;
}

type Handler<TBody = unknown, TQuery = unknown> = (
  params: HandlerParams<TBody, TQuery>,
) => Promise<NextResponse>;

interface HandlerOptions<TBody, TQuery> {
  handler: Handler<TBody, TQuery>;
  auth?: boolean;
  bodySchema?: ZodType<TBody>;
  querySchema?: ZodType<TQuery>;
}

export function apiHandler<TBody = unknown, TQuery = unknown>(
  options: HandlerOptions<TBody, TQuery>,
) {
  return async (
    req: NextRequest,
    { params }: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    try {
      let session: Session | null = null;
      if (options.auth) {
        session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          return apiError('Unauthorized', 401);
        }
      }

      let body: TBody = {} as TBody;
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const jsonBody = await req.json();
        const validationResult = options.bodySchema.safeParse(jsonBody);
        if (!validationResult.success) {
          return NextResponse.json(
            {
              message: 'Validation error in request body',
              errors: validationResult.error.format(),
            },
            { status: 400 },
          );
        }
        body = validationResult.data;
      }

      let query: TQuery = {} as TQuery;
      if (options.querySchema) {
        const queryParams = Object.fromEntries(req.nextUrl.searchParams);
        const validationResult = options.querySchema.safeParse(queryParams);
        if (!validationResult.success) {
          return NextResponse.json(
            {
              message: 'Validation error in query parameters',
              errors: validationResult.error.format(),
            },
            { status: 400 },
          );
        }
        query = validationResult.data;
      }

      return await options.handler({ req, params, session, body, query });
    } catch (error: unknown) {
      console.error('API Route Error:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error', errors: error.format() },
          { status: 400 },
        );
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
      return apiError(errorMessage, 500);
    }
  };
}
