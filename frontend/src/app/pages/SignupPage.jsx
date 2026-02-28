import { useState } from 'react';
import { Link } from 'react-router';
import { FileText, Mail, Lock, User, Building2, Phone } from 'lucide-react';

export function SignupPage() {
  const [userType, setUserType] = useState<'student' | 'representative'>('student');

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground">StudySphere</span>
          </Link>
          <p className="text-muted-foreground">
            Join the academic knowledge-sharing community
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">I am a:</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('student')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                userType === 'student'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <User className="h-6 w-6 mb-2 text-primary" />
              <div className="font-medium text-foreground">Student / Researcher</div>
              <div className="text-sm text-muted-foreground mt-1">
                Verify with institutional email
              </div>
            </button>

            <button
              onClick={() => setUserType('representative')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                userType === 'representative'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building2 className="h-6 w-6 mb-2 text-primary" />
              <div className="font-medium text-foreground">College Representative</div>
              <div className="text-sm text-muted-foreground mt-1">
                Register your institution
              </div>
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Create Account</h2>

          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {userType === 'student' ? 'Institutional Email' : 'Official Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder={
                    userType === 'student'
                      ? 'student@university.edu'
                      : 'admin@university.edu'
                  }
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {userType === 'student'
                  ? 'Use your official university email for verification'
                  : 'Official email required for institution registration'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {userType === 'representative' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Institution Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="University of Example"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}

            {userType === 'representative' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Institution Domain
                </label>
                <input
                  type="text"
                  placeholder="university.edu"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Email domain for student verification (e.g., mit.edu)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Secure & Professional:</strong> All data is
            encrypted. Institutional verification ensures academic integrity.
          </p>
        </div>
      </div>
    </div>
  );
}
