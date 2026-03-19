import { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, RefreshCw, UserCheck, Flag, ShieldAlert, Check, Trash2 } from 'lucide-react';
import { adminService } from '@/api/adminService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function AdminDashboard() {
  const currentUser = getUser();
  const collegeId = currentUser?.collegeId;

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingApproved, setIsLoadingApproved] = useState(true);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [isLoadingFlagged, setIsLoadingFlagged] = useState(false);
  const [isModeratingId, setIsModeratingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingStudents = useCallback(async () => {
    if (!collegeId) { toast.error('College ID not found in session.'); setIsLoadingPending(false); return; }
    setIsLoadingPending(true);
    const res = await adminService.getPendingStudents(collegeId);
    if (res.success) setPendingStudents(res.data);
    else toast.error('Could not fetch pending students: ' + res.message);
    setIsLoadingPending(false);
  }, [collegeId]);

  const fetchApprovedStudents = useCallback(async () => {
    if (!collegeId) { setIsLoadingApproved(false); return; }
    setIsLoadingApproved(true);
    const res = await adminService.getApprovedStudents(collegeId);
    if (res.success) setApprovedStudents(res.data);
    else toast.error('Could not fetch approved students: ' + res.message);
    setIsLoadingApproved(false);
  }, [collegeId]);

  const fetchFlaggedPosts = useCallback(async () => {
    setIsLoadingFlagged(true);
    const res = await adminService.getModerationDashboard();
    if (res.success) setFlaggedPosts(res.data);
    else toast.error('Could not fetch flagged posts: ' + res.message);
    setIsLoadingFlagged(false);
  }, []);

  useEffect(() => {
    fetchPendingStudents();
    fetchApprovedStudents();
    fetchFlaggedPosts();
  }, [fetchPendingStudents, fetchApprovedStudents, fetchFlaggedPosts]);

  const handleApproveStudent = async (studentId, studentName) => {
    setApprovingId(studentId);
    const res = await adminService.approveUser(studentId);
    if (res.success) {
      toast.success(`${studentName} has been approved.`);
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      fetchApprovedStudents(); // Refresh approved list
    } else {
      toast.error(res.message || 'Approval failed.');
    }
    setApprovingId(null);
  };

  const handleRejectStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to reject ${studentName}?`)) return;
    setRejectingId(studentId);
    const res = await adminService.rejectUser(studentId);
    if (res.success) {
      toast.success(`${studentName} registration has been rejected.`);
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
    } else {
      toast.error(res.message || 'Rejection failed.');
    }
    setRejectingId(null);
  };

  const handleModeratePost = async (postId, action) => {
    const confirmMsg = action === 'REMOVE' ? 'Are you sure you want to PERMANENTLY DELETE this post?' : 'Approve post and clear all flags?';
    if (!window.confirm(confirmMsg)) return;

    setIsModeratingId(postId);
    const res = await adminService.resolveModeratedPost(postId, action);
    if (res.success) {
      toast.success(action === 'REMOVE' ? 'Post deleted.' : 'Post approved.');
      setFlaggedPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      toast.error(res.message || 'Moderation failed.');
    }
    setIsModeratingId(null);
  };

  const getActiveList = () => {
    if (activeTab === 'pending') return pendingStudents;
    if (activeTab === 'approved') return approvedStudents;
    return flaggedPosts;
  };

  const getIsLoading = () => {
    if (activeTab === 'pending') return isLoadingPending;
    if (activeTab === 'approved') return isLoadingApproved;
    return isLoadingFlagged;
  };

  const filteredItems = getActiveList().filter(item => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'flagged') {
      return item.title?.toLowerCase().includes(query) || item.author?.fullName?.toLowerCase().includes(query);
    }
    return item.fullName?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">College Administration</h1>
        <p className="text-muted-foreground text-sm">
          Review and manage student registrations for your institution.
        </p>
      </div>

      {/* Stats */}
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
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Approved Students</p>
              <h3 className="text-2xl font-bold text-foreground">{approvedStudents.length}</h3>
            </div>
          </div>
        </div>
        <div className="p-5 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Flagged Posts</p>
              <h3 className="text-2xl font-bold text-foreground">{flaggedPosts.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Approvals ({pendingStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'approved'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved Students ({approvedStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'flagged'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Flagged Content ({flaggedPosts.length})
          </button>
        </div>

        {/* Search + Refresh */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'flagged' ? "Search by title or author..." : "Search by name or email..."}
            className="flex-1 pl-3 pr-4 py-2 text-sm border border-border rounded-md bg-input-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={() => {
              if (activeTab === 'pending') fetchPendingStudents();
              else if (activeTab === 'approved') fetchApprovedStudents();
              else fetchFlaggedPosts();
            }}
            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {getIsLoading() ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No items match your search.' : 
                 activeTab === 'pending' ? 'No pending approvals!' : 
                 activeTab === 'approved' ? 'No approved students yet.' : 
                 'No flagged content to review!'}
              </p>
            </div>
          ) : activeTab === 'flagged' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Post Title</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Reports</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map(post => (
                  <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{post.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{post.content}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{post.author?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">ID: {post.author?.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                        <Flag className="h-3 w-3" />
                        {post.reportCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleModeratePost(post.id, 'APPROVE')}
                        disabled={isModeratingId === post.id}
                        className="p-1.5 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-md transition-colors"
                        title="Approve & Clear Flags"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleModeratePost(post.id, 'REMOVE')}
                        disabled={isModeratingId === post.id}
                        className="p-1.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                        title="Remove Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Full Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Student ID</th>
                  {activeTab === 'pending' && <th className="px-6 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map(student => (
                  <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{student.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-mono">{student.studentId}</td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveStudent(student.id, student.fullName)}
                          disabled={approvingId === student.id}
                          className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                        >
                          {approvingId === student.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectStudent(student.id, student.fullName)}
                          disabled={rejectingId === student.id || approvingId === student.id}
                          className="px-4 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                        >
                          {rejectingId === student.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </td>
                    )}
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
