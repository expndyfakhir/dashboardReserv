import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminLayout from "../components/AdminLayout";

// Rename the function to AdminLayoutWrapper
export default async function AdminLayoutWrapper({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  return (
    <AdminLayout session={session}>
      {children}
    </AdminLayout>
  );
}