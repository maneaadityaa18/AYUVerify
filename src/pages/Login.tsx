import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple inline validation mirroring Section 81.2
    const validationErrors: Record<string, string> = {};
    if (!email) {
      validationErrors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Please enter a valid email address.';
    }
    
    if (!password) {
      validationErrors.password = 'Please enter your password.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please correct form validation errors.', 'error');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login({ email, password });
      showToast('Logged in successfully!', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8" hoverable={false}>
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 bg-ayur-green-50 text-ayur-green-600 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Welcome to AyurVerify</h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to access your role-based raw material ledger
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            required
          />

          <Button type="submit" isLoading={isLoading} loadingText="Verifying..." className="w-full mt-2">
            Log In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-500">
          New participant?{' '}
          <Link to="/auth/register" className="text-ayur-green-600 hover:text-ayur-green-700 underline">
            Register for a Participant ID
          </Link>
        </div>
      </Card>
    </div>
  );
};
