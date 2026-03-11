import { Link, useNavigate } from 'react-router';
import { FileText, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../api/authService';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await authService.login({ email, password });
      if (res.success) {
        localStorage.setItem('access_token', res.data.token);
        localStorage.setItem('user_info', JSON.stringify({
          id: res.data.userId,
          role: res.data.role,
          status: res.data.status || 'ACTIVE',
          collegeId: res.data.collegeId || null  // only set for COLLEGE_ADMIN accounts
        }));
        toast.success("Login successful!");
        navigate('/');
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">StudySphere</span>
          </Link>
          <p className="text-muted-foreground">
            Federated Inter-Institutional Academic Platform
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Welcome Back</h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Secure academic collaboration platform</p>
          <p className="mt-1">Institutional email verification required</p>
        </div>
      </div>
    </div>
  );
}
