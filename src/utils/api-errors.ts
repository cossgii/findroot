export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = '권한이 없습니다.') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends ApiError {
  constructor(message = '데이터가 충돌되었습니다.') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
