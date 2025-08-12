function getRequiredEnvVar(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`CRITICAL: Environment variable "${varName}" is not set.`);
  }
  return value;
}

export const MAIN_ACCOUNT_ID = getRequiredEnvVar('MAIN_ACCOUNT_ID');
export const GOOGLE_CLIENT_ID = getRequiredEnvVar('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getRequiredEnvVar('GOOGLE_CLIENT_SECRET');
export const KAKAO_CLIENT_ID = getRequiredEnvVar('KAKAO_CLIENT_ID');
export const KAKAO_CLIENT_SECRET = getRequiredEnvVar('KAKAO_CLIENT_SECRET');
export const NEXTAUTH_SECRET = getRequiredEnvVar('NEXTAUTH_SECRET');

// 참고: authOptions.ts 파일에서도 process.env 대신 이 config 파일을 사용하도록 수정해야 합니다.
