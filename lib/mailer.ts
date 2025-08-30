
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_FROM;
const emailPass = process.env.EMAIL_SERVER_PASSWORD;
const emailHost = process.env.EMAIL_SERVER_HOST;
const emailPort = process.env.EMAIL_SERVER_PORT;

if (!emailUser || !emailPass || !emailHost || !emailPort) {
  console.warn(
    'Email server environment variables not fully configured. Email sending will be disabled.',
  );
}

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: Number(emailPort),
  secure: Number(emailPort) === 465, // true for 465, false for other ports
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (mailOptions: MailOptions) => {
  if (!emailUser) {
    console.error('Email sending is disabled due to missing configuration.');
    // In a real app, you might want to throw an error or handle this differently
    return; 
  }
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions: MailOptions = {
        from: `"FindRoot" <${emailUser}>`,
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
    };

    await sendEmail(mailOptions);
};
