'use client';

import DashboardLayout from './DashboardLayout';

export default function AdminLayout({ session, children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
  }