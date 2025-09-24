import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!resendApiKey || !emailFrom) {
  console.warn(
    'RESEND_API_KEY or EMAIL_FROM environment variable is not set. Email sending will be disabled.',
  );
}

const resend = new Resend(resendApiKey);

export const sendPasswordResetEmail = async (to: string, selector: string, validator: string) => {
    if (!resendApiKey || !emailFrom) {
        console.error('Email sending is disabled due to missing configuration.');
        // In a real app, you might want to throw an error or handle this differently
        return; 
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?selector=${selector}&validator=${validator}`;

    try {
        await resend.emails.send({
            from: `"FindRoot" <${emailFrom}>`,
            to: to,
            subject: '[FindRoot] 비밀번호 재설정 요청',
            html: `
                <h1>비밀번호 재설정</h1>
                <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요. 이 링크는 1시간 동안 유효합니다.</p>
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    비밀번호 재설정하기
                </a>
                <p>만약 버튼이 동작하지 않으면, 아래 주소를 복사하여 브라우저에 붙여넣으세요:</p>
                <p>${resetUrl}</p>
            `,
        });
        console.log('Password reset email sent successfully via Resend.');
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        throw new Error('Failed to send email.');
    }
};