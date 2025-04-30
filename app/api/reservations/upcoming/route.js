import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    
    // Format current time in HH:mm format
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const futureTime = oneHourFromNow.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        date: new Date(now.toISOString().split('T')[0]),
        time: {
          gte: currentTime,
          lte: futureTime
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      include: {
        table: true
      }
    });

    const formattedReservations = upcomingReservations.map(res => ({
      id: res.id,
      customerName: res.customerName,
      date: res.date,
      time: res.time,
      partySize: res.partySize,
      status: res.status,
      customerPhone: res.customerPhone,
      customerEmail: res.customerEmail,
      tableNumber: res.table?.tableNumber,
      specialRequests: res.specialRequests
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error('Error fetching upcoming reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming reservations' },
      { status: 500 }
    );
  }
}