import { useState, useEffect, useCallback } from 'react';
import { Building2, Users, FileText, CheckCircle2, X, Clock, RefreshCw } from 'lucide-react';
import { adminService } from '@/api/adminService';
import { toast } from 'sonner';

export function SuperAdminDashboard() {
  // ——— College provisioning state ———
  const [institutions, setInstitutions] = useState([]);
  const [isAddingInstitution, setIsAddingInstitution] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInstitution, setNewInstitution] = useState({ name: '', domain: '' });

  // ——— Pending admins approval state ———
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingAdmins = useCallback(async () => {
    setIsLoadingPending(true);
    const res = await adminService.getPendingCollegeAdmins();
    if (res.success) {
      setPendingAdmins(res.data);
    } else {
      toast.error('Could not fetch pending admins: ' + res.message);
    }
    setIsLoadingPending(false);
  }, []);

  useEffect(() => {
    fetchPendingAdmins();
  }, [fetchPendingAdmins]);

  // ——— Handle Provision Institution ———
  const handleAddInstitution = async (e) => {
    e.preventDefault();
    if (!newInstitution.name || !newInstitution.domain) {
      toast.error('Institution name and domain are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminService.createCollege(newInstitution.name, newInstitution.domain);
      if (res.success) {
        const created = res.data;
        toast.success(`✓ Institution created! College ID: ${created.id} — Share this with the College Admin.`);
        setInstitutions(prev => [...prev, { id: created.id, name: created.name, status: 'Active' }]);
        setNewInstitution({ name: '', domain: '' });
        setIsAddingInstitution(false);
      } else {
        toast.error(res.message || 'Failed to create institution.');
      }
    } finally {
      // Always reset submitting state so modal is never stuck
      setIsSubmitting(false);
    }
  };

  // ——— Handle Approve College Admin ———
  const handleApproveAdmin = async (userId, adminName) => {
    setApprovingId(userId);
    const res = await adminService.approveUser(userId);
    if (res.success) {
      toast.success(`${adminName} has been approved as a College Admin.`);
      setPendingAdmins(prev => prev.filter(u => u.id !== userId));
    } else {
      toast.error(res.message || 'Approval failed.');
    }
    setApprovingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-1">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">Manage institutions and approve College Administrators.</p>
      </div>

      {/* Stats — only show data we actually have from the backend */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Provisioned Institutions', value: institutions.length, icon: Building2, color: 'text-primary bg-primary/10' },
          { label: 'Pending Admin Approvals', value: pendingAdmins.length, icon: Clock, color: pendingAdmins.length > 0 ? 'text-orange-500 bg-orange-500/10' : 'text-green-500 bg-green-500/10' },
        ].map(stat => (
          <div key={stat.label} className="p-5 bg-card border border-border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ——— Pending Approval Queue ——— */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-foreground">College Admin Approval Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Approve or reject representatives waiting to manage their institutions.</p>
          </div>
          <button
            onClick={fetchPendingAdmins}
            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          {isLoadingPending ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading pending approvals...</div>
          ) : pendingAdmins.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">No pending approvals. All caught up!</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">User ID</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingAdmins.map(admin => (
                  <tr key={admin.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{admin.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{admin.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-mono">#{admin.id}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApproveAdmin(admin.id, admin.fullName)}
                        disabled={approvingId === admin.id}
                        className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                      >
                        {approvingId === admin.id ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ——— Registered Institutions Table ——— */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Registered Institutions</h2>
          <button
            onClick={() => setIsAddingInstitution(true)}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            + Add Institution
          </button>
        </div>
        <div className="overflow-x-auto">
          {institutions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No institutions provisioned yet. Click <strong>"+ Add Institution"</strong> to get started.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Institution Name</th>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{inst.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono font-bold text-primary">#{inst.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ——— Add Institution Modal ——— */}
      {isAddingInstitution && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Provision New Institution</h2>
              <button
                onClick={() => { setIsAddingInstitution(false); setIsSubmitting(false); }}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddInstitution} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Institution Name</label>
                <input
                  type="text"
                  value={newInstitution.name}
                  onChange={e => setNewInstitution({ ...newInstitution, name: e.target.value })}
                  placeholder="e.g., Harvard University"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Domain</label>
                <input
                  type="text"
                  value={newInstitution.domain}
                  onChange={e => setNewInstitution({ ...newInstitution, domain: e.target.value })}
                  placeholder="e.g., harvard.edu"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Used for verifying student institutional emails.</p>
              </div>

              <div className="pt-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  📋 After provisioning, share the generated <strong>College ID</strong> with the College Representative so they can register.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingInstitution(false); setIsSubmitting(false); }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-foreground font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
