import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FileText, Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { authService } from '../../api/authService';
import { toast } from 'sonner';

export function SignupPage() {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    studentId: '',
    collegeId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const parsedCollegeId = parseInt(formData.collegeId, 10);
      let res;
      
      if (userType === 'student') {
        // Matches StudentRegistrationDto
        res = await authService.registerStudent({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId,
          collegeId: isNaN(parsedCollegeId) ? 1 : parsedCollegeId
        });
      } else {
        // Matches CollegeAdminRegistrationDto
        res = await authService.registerAdmin({
          adminFullName: formData.fullName,
          adminEmail: formData.email,
          adminPassword: formData.password,
          collegeId: isNaN(parsedCollegeId) ? 1 : parsedCollegeId
        });
      }
      
      if (res.success) {
        toast.success(res.message || "Registration successful! Please wait for approval.");
        navigate('/login');
      } else {
        // Handle explicit backend RuntimeException strings
        if (res.message && res.message.includes("College not found")) {
          toast.error("Invalid College ID. Please request the correct ID from the Platform Super Admin.");
        } else {
          toast.error(res.message || "Registration failed");
        }
      }
    } catch (err) {
      if (err.message && err.message.includes("College not found")) {
        toast.error("Invalid College ID. Please request the correct ID from the Platform Super Admin.");
      } else {
        toast.error(err.message || "An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              type="button"
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
              type="button"
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

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {userType === 'student' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  placeholder="STU-10293"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {userType === 'student' ? 'Institutional Email' : 'Official Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
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
                College ID <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your registered College ID"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-1.5 text-xs text-orange-500 font-medium">
                Note: Your institution must be provisioned by the Platform Super Admin first. Ask them for your College ID.
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
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 123-4567"
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
