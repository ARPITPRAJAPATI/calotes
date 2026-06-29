'use client'; // Flags this file as a client component to handle local states, selectors, and browser API calls

// Import state and lifecycle hooks
import { useState, useEffect } from 'react';
// Import hot toast notification triggers
import toast from 'react-hot-toast';
// Import UI vector graphics icons
import { Loader2, RefreshCw, Crown, User as UserIcon } from 'lucide-react';

// User interface definition matching DB schemas
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatar?: string;
}

export default function AdminCustomersPage() {
  // Directory lists and loader status states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // Full screen spinner tracker
  const [refreshing, setRefreshing] = useState(false); // Silent table reload spinner tracker

  // Fetch users directory list from database api
  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data); // Hydrate user directory state lists
      } else {
        toast.error(data.error || 'Failed to retrieve customers');
      }
    } catch {
      toast.error('An error occurred while loading customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user permissions / roles dynamically in database via PUT requests
  const handleRoleChange = async (id: string, newRole: string) => {
    const updatingToast = toast.loading('Updating user permissions...');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }), // Bind role string parameter
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Role updated to ${newRole}!`, { id: updatingToast });
        // Update user state array in memory instantly to refresh UI
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(data.error || 'Failed to update role', { id: updatingToast });
      }
    } catch {
      toast.error('An error occurred during update', { id: updatingToast });
    }
  };

  if (loading) {
    // Full screen loading screen
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-xs font-black uppercase tracking-widest text-text gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <span>Retrieving Customers Directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and stats */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
            Customer Directory
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
            Total Registered Users: {users.length}
          </p>
        </div>
        {/* Silent refresh button option */}
        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-card transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-bg text-[10px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="p-4">Customer Details</th>
              <th className="p-4 w-40">Registration Date</th>
              <th className="p-4 w-32">Rank</th>
              <th className="p-4 w-44 text-right">Role Power Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-bold uppercase tracking-widest text-xs">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-bg/50 transition-colors">
                {/* Visual role icons and email details */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bg border border-border flex items-center justify-center text-muted">
                      {user.role === 'admin' ? (
                        <Crown size={14} className="text-accent" /> // Crown for Admin role
                      ) : (
                        <UserIcon size={14} /> // UserIcon for customer role
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-text">{user.name}</span>
                      <span className="text-[9px] text-muted normal-case font-semibold tracking-normal">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                {/* Formatted Date */}
                <td className="p-4 text-muted">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                {/* Rank Badge */}
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-[8px] border font-black tracking-widest ${
                      user.role === 'admin'
                        ? 'bg-accent/10 border-accent/40 text-text'
                        : 'bg-bg border-border text-muted'
                    }`}
                  >
                    {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                  </span>
                </td>
                {/* Role dropdown switcher */}
                <td className="p-4 text-right">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-transparent border border-border text-[10px] font-black uppercase tracking-widest p-2 outline-none cursor-pointer"
                  >
                    <option value="customer">Make Customer</option>
                    <option value="admin">Promote to Admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {/* Empty Directory State */}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted font-bold text-xs uppercase tracking-widest">
                  No customers registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

