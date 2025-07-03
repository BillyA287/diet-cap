import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  const [formState, setFormState] = useState({
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format.';
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormState({ ...formState, error: validationError });
      return;
    }
    setFormState({ ...formState, error: '' });

    try {
      const endpoint = isSignUp ? '/signup' : '/login';
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(isSignUp && { firstName, lastName }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const data = await response.json();
      
      if (isSignUp) {
        alert('Account created successfully! Please log in.');
        setFormState({ ...formState, isSignUp: false }); // Switch to login
      } else {
        // Save JWT token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Token saved:', data.access_token);
        console.log('User data saved:', data.user);
        
        // Navigate to dashboard instead of alert
        navigate('/dashboard');
      }
      
      console.log('Response from backend:', data);
    } catch (err: any) {
      setFormState({ ...formState, error: err.message });
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
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default Login;