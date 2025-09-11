"use client";
import { useState } from 'react';
import apiClient from '../../lib/apiClient';

export default function SignupPage() {
  const [step, setStep] = useState(1); // 1 for signup, 2 for OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post('/api/auth/signup', { name, email, password });
      setMessage('OTP sent to your email!');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign up');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post('/api/auth/verify-otp', { email, otp });
      setMessage('Verification successful! You can now log in.');
      // Optionally redirect to login page after a delay
    } catch (err: any) {
      setError(err.response?.data?.detail || 'OTP verification failed');
    }
  };

  return (
    <div className="container mx-auto max-w-md p-8">
      {step === 1 ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 p-3 rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 p-3 rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 p-3 rounded" required />
            <button type="submit" className="w-full bg-cyan-600 p-3 rounded font-bold">Create Account</button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-6">Verify OTP</h1>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-gray-700 p-3 rounded" required />
            <button type="submit" className="w-full bg-cyan-600 p-3 rounded font-bold">Verify</button>
          </form>
        </>
      )}
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {message && <p className="text-green-400 text-center mt-4">{message}</p>}
    </div>
  );
}