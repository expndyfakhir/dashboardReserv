import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gt: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        table: true
      },
      take: 5 // Limit to 5 most recent reservations
    });

    const formattedReservations = upcomingReservations.map(res => ({
      id: res.id,
      customer: res.customerName,
      date: new Date(res.date).toLocaleDateString(),
      guests: res.partySize,
      status: res.status,
      phone: res.customerPhone
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