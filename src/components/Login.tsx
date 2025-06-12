import React, { useState } from 'react';
import type { LoginFormState } from '../types';

const Login = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isSignUp: false,
    error: '',
  });

  const { email, password, firstName, lastName, isSignUp, error } = formState;

  const validateForm = (): string | null => {
    if (isSignUp) {
      if (!firstName.trim()) return 'First name is required.';
      if (!lastName.trim()) return 'Last name is required.';
    }
    if (!email.trim()) return 'Email is required.';
    if (!email.includes('@')) return 'Email must contain an "@" sign.';
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormState({ ...formState, error: validationError });
      return;
    }
    setFormState({ ...formState, error: '' });
    if (isSignUp) {
      console.log({ firstName, lastName, email, password });
    } else {
      console.log({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        {isSignUp ? 'Sign Up for DietCap' : 'Sign In to DietCap'}
      </h1>
      <form className="w-full max-w-xs flex flex-col gap-4" onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
              className="px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
              className="px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          className="px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setFormState({ ...formState, password: e.target.value })}
          className="px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
        >
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => setFormState({ ...formState, isSignUp: !isSignUp, error: '' })}
        className="mt-4 text-blue-600 hover:underline"
      >
        {isSignUp ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
      </button>
    </div>
  );
};

export default Login;