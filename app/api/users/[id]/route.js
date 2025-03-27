import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(
  request,
  { params }
) {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Validate input
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id || !action || !['ban', 'unban'].includes(action)) {
      return NextResponse.json(
        { message: 'Valid ID and action (ban/unban) are required' },
        { status: 400 }
      );
    }

    // Update admin status
    const updatedAdmin = await prisma.users.update({
      where: { id: params.id },
      data: { isActive: action === 'unban' }
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { message: 'Error updating admin status' },
      { status: 500 }
    );
  }
}