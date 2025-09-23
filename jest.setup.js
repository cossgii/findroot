import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.MAIN_ACCOUNT_ID = 'test-main-account-id';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.KAKAO_CLIENT_ID = 'test-kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'test-kakao-client-secret';
process.env.EMAIL_FROM = 'test@example.com';
process.env.EMAIL_SERVER_PASSWORD = 'test-password';
process.env.EMAIL_SERVER_HOST = 'test-host';
process.env.EMAIL_SERVER_PORT = '587';

// Next.js Image 컴포넌트 목킹 (필요한 경우)
// Object.defineProperty(global.Image, 'src', {
//   set(src) {
//     this.setAttribute('src', src);
//   },
// });
