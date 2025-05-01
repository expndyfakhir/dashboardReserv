import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Create dates in Morocco timezone (UTC+1)
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    
    // Format time in HH:mm format using Morocco timezone
    const currentTime = now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca', hour12: false, hour: '2-digit', minute: '2-digit' });
    const futureTime = oneHourFromNow.toLocaleString('en-US', { timeZone: 'Africa/Casablanca', hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                // Reservations for today with time greater than or equal to current time
                date: new Date(now.toISOString().split('T')[0]),
                time: {
                  gte: currentTime
                }
              },
              {
                // Reservations for tomorrow with time less than future time if we're near midnight
                date: new Date(oneHourFromNow.toISOString().split('T')[0]),
                time: {
                  lte: futureTime
                }
              }
            ]
          },
          {
            status: {
              in: ['pending', 'confirmed']
            }
          }
        ]
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