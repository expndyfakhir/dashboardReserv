import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the total count of tables
    const count = await prisma.table.count();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting table count:', error);
    return NextResponse.json(
      { message: 'Error getting table count' },
      { status: 500 }
    );
  }
}