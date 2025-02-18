'use client';

import dynamic from 'next/dynamic';

const SignUpForm = dynamic(
  () => import('../../components/SignUpForm'),
  { ssr: false }
);

export default function SignUpPage() {
  return <SignUpForm />;
} 