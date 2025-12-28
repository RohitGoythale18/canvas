import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const register = async (data: RegisterData): Promise<RegisterResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // After successful registration, automatically log the user in
      // For now, we'll just return the result. In a real app, you might want to
      // send a verification email or require email verification before login

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
