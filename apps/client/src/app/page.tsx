import React from "react";
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Welcome to the App</h1>
      <div className="space-x-4">
        <Link 
          href="/login" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
} 