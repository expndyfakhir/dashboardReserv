// app/api/users/count/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the total count of admin users (both ADMIN and SUPER_ADMIN)
    const count = await prisma.users.count({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting admin count:', error);
    return NextResponse.json(
      { message: 'Error getting admin count' },
      { status: 500 }
    );
  }
}