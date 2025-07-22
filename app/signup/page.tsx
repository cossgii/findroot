import { SignupForm } from '~/src/components/auth/signup-form';
import MainContainer from '~/src/components/layout/main-container';

export default function SignupPage() {
  return (
    <MainContainer className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">회원가입</h2>
        <SignupForm />
      </div>
    </MainContainer>
  );
}