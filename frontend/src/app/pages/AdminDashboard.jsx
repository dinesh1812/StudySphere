import { useState, useEffect, useCallback } from 'react';
import { Users, FileX, CheckCircle, RefreshCw } from 'lucide-react';
import { adminService } from '@/api/adminService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function AdminDashboard() {
  const currentUser = getUser();
  const collegeId = currentUser?.collegeId; // Attached to the JWT / user_info

  // ——— Live data state ———
  const [pendingStudents, setPendingStudents] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingStudents = useCallback(async () => {
    if (!collegeId) {
      toast.error('College ID not found in session. Please log out and log back in.');
      setIsLoadingPending(false);
      return;
    }
    setIsLoadingPending(true);
    const res = await adminService.getPendingStudents(collegeId);
    if (res.success) {
      setPendingStudents(res.data);
    } else {
      toast.error('Could not fetch pending students: ' + res.message);
    }
    setIsLoadingPending(false);
  }, [collegeId]);

  useEffect(() => {
    fetchPendingStudents();
  }, [fetchPendingStudents]);

  // ——— Approve a student ———
  const handleApproveStudent = async (studentId, studentName) => {
    setApprovingId(studentId);
    const res = await adminService.approveUser(studentId);
    if (res.success) {
      toast.success(`${studentName} has been verified and approved.`);
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
    } else {
      toast.error(res.message || 'Approval failed.');
    }
    setApprovingId(null);
  };

  // ——— Derived ———
  const filteredStudents = pendingStudents.filter(s =>
    s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">College Administration</h1>
        <p className="text-muted-foreground text-sm">
          Review and approve student registrations for your institution.
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-foreground">{pendingStudents.length}</h3>
            </div>
          </div>
        </div>
        <div className="p-5 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <FileX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Your College ID</p>
              <h3 className="text-2xl font-bold text-foreground font-mono">#{collegeId ?? '—'}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Student Verification Queue */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Student Verification Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These students registered with your college ID and await your approval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-3 pr-4 py-2 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-52 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={fetchPendingStudents}
              className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground flex-shrink-0"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingPending ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading pending students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No students match your search.' : 'No pending approvals. All caught up!'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Full Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Student ID</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{student.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-mono">{student.studentId}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleApproveStudent(student.id, student.fullName)}
                        disabled={approvingId === student.id}
                        className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                      >
                        {approvingId === student.id ? 'Approving...' : 'Verify & Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
