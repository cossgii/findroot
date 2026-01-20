function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set in environment variables.`);
  }
  return value;
}

export const GOOGLE_CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getEnvVar('GOOGLE_CLIENT_SECRET');
export const KAKAO_CLIENT_ID = getEnvVar('KAKAO_CLIENT_ID');
export const KAKAO_CLIENT_SECRET = getEnvVar('KAKAO_CLIENT_SECRET');
export const MAIN_ACCOUNT_ID = getEnvVar('MAIN_ACCOUNT_ID');
export const NEXTAUTH_SECRET = getEnvVar('NEXTAUTH_SECRET');
