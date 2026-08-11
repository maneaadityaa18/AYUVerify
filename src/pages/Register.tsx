import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useUI } from '../context/UIContext';
import { authService } from '../services/authService';
import { getFriendlyErrorMessage } from '../services/api';

type RoleOption = 'COLLECTOR' | 'WHOLESALER' | 'DISTRIBUTOR' | 'MANUFACTURER' | 'EXPERT';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleOption>('COLLECTOR');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{ id: string; name: string } | null>(null);

  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field validations matching Section 81.1
    const validationErrors: Record<string, string> = {};
    if (name.length < 2) {
      validationErrors.name = 'Please enter your full name (min 2 characters).';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Please enter a valid email address.';
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      validationErrors.password = 'Password must be at least 8 characters with letters and numbers.';
    }
    if (orgName.length < 2) {
      validationErrors.orgName = 'Please enter your organization name.';
    }
    if (location.length < 2) {
      validationErrors.location = 'Please enter your location.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please fix the validation errors.', 'error');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authService.register({
        name,
        email,
        password,
        role,
        organizationName: orgName,
        location,
      });

      setRegisteredUser({
        id: response.participantId,
        name: response.name,
      });

      showToast('Registration successful!', 'success');
    } catch (err) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      showToast(friendlyMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredUser) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6" hoverable={false}>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registration Successful</h2>
            <p className="text-xs text-slate-500 mt-1">Welcome aboard, {registeredUser.name}!</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 w-full flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Your AyurVerify Participant ID
            </span>
            <span className="text-2xl font-extrabold tracking-widest text-ayur-green-700 my-2 select-all">
              {registeredUser.id}
            </span>
            <span className="text-[10px] text-slate-500 font-medium px-4 text-center">
              Save this ID for identification within the supply chain transactions.
            </span>
          </div>

          <Button onClick={() => navigate('/auth/login')} className="w-full">
            Proceed to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-8">
      <Card className="max-w-md w-full p-8" hoverable={false}>
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 bg-ayur-green-50 text-ayur-green-600 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 font-medium">
            Register to join the verified Ayurvedic supply chain
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Full Name"
            placeholder="Rajesh Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isLoading}
            required
          />

          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="rajesh@example.com"
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
            placeholder="At least 8 chars, 1 letter, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            required
          />

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="role" className="text-xs font-semibold text-ayur-slate-700">
              Role Option
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleOption)}
              className="w-full bg-white border border-ayur-slate-200 rounded-lg px-3.5 py-2 text-sm text-ayur-slate-900 focus:outline-none focus:ring-2 focus:ring-ayur-green-500 focus:border-transparent transition-all font-semibold"
              disabled={isLoading}
            >
              <option value="COLLECTOR">Collector (COL)</option>
              <option value="WHOLESALER">Wholesaler (WHO)</option>
              <option value="DISTRIBUTOR">Distributor (DIS)</option>
              <option value="MANUFACTURER">Manufacturer (MAN)</option>
              <option value="EXPERT">Expert Botanist (EXP)</option>
            </select>
          </div>

          <Input
            id="orgName"
            label="Organization Name"
            placeholder="Patel Herbal Collection"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            error={errors.orgName}
            disabled={isLoading}
            required
          />

          <Input
            id="location"
            label="Location"
            placeholder="Ahmedabad, Gujarat"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            error={errors.location}
            disabled={isLoading}
            required
          />

          <Button type="submit" isLoading={isLoading} loadingText="Registering..." className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-ayur-green-600 hover:text-ayur-green-700 underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
