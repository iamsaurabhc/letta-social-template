'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginForm = dynamic(
  () => import('../../components/LoginForm'),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginForm />;
} 