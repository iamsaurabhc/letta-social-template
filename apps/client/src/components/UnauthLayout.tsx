import Link from 'next/link';

export default function UnauthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex justify-end p-4 space-x-4">
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
      {children}
    </div>
  );
} 