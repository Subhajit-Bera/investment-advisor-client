"use client";
import Link from 'next/link';
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-cyan-400">
          AI Advisor
        </Link>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="hover:text-cyan-400">Login</Link>
              <Link href="/signup" className="bg-cyan-600 px-3 py-2 rounded hover:bg-cyan-700">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}