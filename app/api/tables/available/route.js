import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get party size from query parameters
    const searchParams = request.nextUrl.searchParams;
    const partySize = searchParams.get('partySize');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    // Validate party size
    const partySizeNum = parseInt(partySize, 10);
    if (!partySize || isNaN(partySizeNum) || partySizeNum < 1) {
      return NextResponse.json(
        { message: 'Invalid party size' },
        { status: 400 }
      );
    }

    // First try to find exact capacity match
    let availableTables = await prisma.table.findMany({
      where: {
        capacity: partySizeNum,
        isAvailable: true
      },
      orderBy: [
        { tableNumber: 'asc' }
      ]
    });

    // If no exact matches, look for larger tables including divisible ones
    if (availableTables.length === 0) {
      const largerTables = await prisma.table.findMany({
        where: {
          OR: [
            // Regular larger tables
            {
              capacity: { gt: partySizeNum },
              isAvailable: true
            },
            // Divisible tables that can be split (8-person tables for 4-person groups)
            {
              capacity: 8,
              isDivisible: true,
              isAvailable: true,
              OR: [
                { splitStatus: null },
                { splitStatus: 'left' },
                { splitStatus: 'right' }
              ]
            }
          ]
        },
        orderBy: [
          { capacity: 'asc' },
          { tableNumber: 'asc' }
        ]
      });
      availableTables = largerTables;
    }

    // If date and time are provided, filter out tables that are already reserved
    if (date && time) {
      const availableTableIds = [];
      
      for (const table of availableTables) {
        let existingReservation = await prisma.reservation.findFirst({
          where: {
            tableId: table.id,
            date: new Date(date),
            time: time,
            status: { in: ['pending', 'confirmed'] }
          }
        });

        if (!existingReservation) {
          availableTableIds.push(table);
        }
      }

      return NextResponse.json(availableTableIds);
    }

    return NextResponse.json(availableTables);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    return NextResponse.json(
      { message: 'Error fetching available tables' },
      { status: 500 }
    );
  }
}