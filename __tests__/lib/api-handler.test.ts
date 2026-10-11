/**
 * @jest-environment node
 */

import { apiSuccess } from '~/src/lib/api-handler';

describe('apiSuccess', () => {
  it('status 204일 때 예외 없이 body가 없는 응답을 반환해야 한다', async () => {
    // NextResponse.json(null, { status: 204 })는 Response 생성 시점에 예외를 던진다.
    // (DB 작업은 끝났는데 응답 생성만 실패해서 500으로 보이던 버그에 대한 회귀 테스트)
    const response = apiSuccess(null, 204);

    expect(response.status).toBe(204);
    const text = await response.text();
    expect(text).toBe('');
  });

  it('기본 상태 코드(200)에서는 데이터를 JSON으로 반환해야 한다', async () => {
    const response = apiSuccess({ ok: true });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });
});
