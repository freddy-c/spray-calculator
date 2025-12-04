import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export function PasswordResetEmail({ resetUrl, userName }: PasswordResetEmailProps) {
  return (
    <div>
      <h1>Reset Your Password</h1>
      <p>{userName ? `Hi ${userName},` : 'Hi there,'}</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <a href={resetUrl}>Reset Password</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn&apos;t request a password reset, you can safely ignore this email.</p>
    </div>
  );
}
