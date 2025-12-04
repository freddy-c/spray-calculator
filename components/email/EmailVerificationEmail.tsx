import * as React from 'react';

interface EmailVerificationEmailProps {
  verificationUrl: string;
  userName?: string;
}

export function EmailVerificationEmail({ verificationUrl, userName }: EmailVerificationEmailProps) {
  return (
    <div>
      <h1>Verify Your Email Address</h1>
      <p>{userName ? `Hi ${userName},` : 'Hi there,'}</p>
      <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
      <a href={verificationUrl}>Verify Email Address</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>{verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn&apos;t create an account, you can safely ignore this email.</p>
    </div>
  );
}
