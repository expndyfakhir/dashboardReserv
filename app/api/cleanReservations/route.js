// Add this temporary cleanup route
// Create app/api/cleanReservations/route.js
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Find all tables
    const validTableIds = (await prisma.table.findMany()).map(t => t.id);
    
    // Find invalid reservations
    const invalidReservations = await prisma.reservation.findMany({
      where: {
        NOT: {
          tableId: { in: validTableIds }
        }
      }
    });

    // Delete invalid reservations
    const deleteResult = await prisma.reservation.deleteMany({
      where: {
        id: { in: invalidReservations.map(r => r.id) }
      }
    });

    return NextResponse.json({
      message: `Cleaned ${deleteResult.count} invalid reservations`,
      deletedIds: invalidReservations.map(r => r.id)
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}