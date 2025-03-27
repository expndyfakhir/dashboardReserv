import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total reservations count
    const totalReservations = await prisma.reservation.count();

    // Get confirmed reservations count
    const confirmedReservations = await prisma.reservation.count({
      where: { status: 'confirmed' }
    });

    // Get pending reservations count
    const pendingReservations = await prisma.reservation.count({
      where: { status: 'pending' }
    });

    return NextResponse.json({
      totalReservations,
      confirmedReservations,
      pendingReservations
    });
  } catch (error) {
    console.error('Error fetching reservation counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation counts' },
      { status: 500 }
    );
  }
}