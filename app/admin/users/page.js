'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlusIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ADMIN'
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      router.push('/login');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      await fetchUsers();
      setShowCreateModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'ADMIN'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          action: currentStatus ? 'ban' : 'unban'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 flex items-center justify-center">
        <div className="p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[#316160]/10 relative">
          <div className="w-16 h-16 relative animate-spin">
            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-[#316160] border-l-[#316160]/50 border-r-[#316160]/30"></div>
            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#316160]/80 border-l-[#316160]/40 border-r-[#316160]/20 animate-spin"></div>
          </div>
          <div className="mt-4 text-[#316160]/70 text-sm font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-slate-200/50 p-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/70 bg-clip-text text-transparent">User Management</h1>
            <p className="mt-2 text-[#316160]/60">Manage your restaurant's administrators and their permissions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#316160] hover:bg-[#316160]/90 text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={actionLoading}
          >
            <UserPlusIcon className="h-5 w-5" />
            Create New Admin
          </motion.button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-100 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2"
          >
            <div className="p-2 bg-rose-200 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            {error}
          </motion.div>
        )}

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#316160]/10 rounded-lg">
                          <UserIcon className="h-5 w-5 text-[#316160]" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{`${user.firstName} ${user.lastName}`}</div>
                          <div className="text-sm text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#316160]/10 text-[#316160]">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${user.isActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        disabled={actionLoading}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200/50"
          >
            <h2 className="text-2xl font-bold text-[#316160] mb-6">Create New Admin</h2>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#316160] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#316160] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#316160] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#316160] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#316160] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#316160] hover:bg-[#316160]/90 text-white rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}