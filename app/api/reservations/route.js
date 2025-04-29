import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

async function findAvailableTable(partySize, date, time) {
  // Convert partySize to number and ensure it's valid
  const partySizeNum = parseInt(partySize, 10);
  if (isNaN(partySizeNum)) {
    throw new Error('Invalid party size');
  }

  // First try to find tables with exact capacity match
  let availableTables = await prisma.table.findMany({
    where: {
      capacity: partySizeNum,
      isAvailable: true
    }
  });

  // If no exact matches found, find tables that can accommodate the party size
  if (availableTables.length === 0) {
    availableTables = await prisma.table.findMany({
      where: {
        OR: [
          // Regular larger tables
          {
            capacity: { gte: partySizeNum },
            isAvailable: true,
            isDivisible: false
          },
          // Divisible 8-person tables for 4 or fewer guests
          {
            capacity: 8,
            isDivisible: true,
            isAvailable: true
          }
        ]
      },
      orderBy: { capacity: 'asc' } // Get smallest suitable table first
    });
  }

  // Check if these tables are already reserved for the requested time
  for (const table of availableTables) {
    // Special handling for divisible 8-person tables
    if (table.isDivisible && table.capacity === 8 && partySizeNum <= 4) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId: table.id,
          date: new Date(date),
          time: time,
          status: { in: ['pending', 'confirmed'] }
        }
      });

      // Check if table can be split
      if (!existingReservation || 
          (table.splitStatus === 'left' && partySizeNum <= 4) || 
          (table.splitStatus === 'right' && partySizeNum <= 4)) {
        return {
          ...table,
          canSplit: true,
          availableSide: !existingReservation ? 'both' : 
                       table.splitStatus === 'left' ? 'right' : 'left'
        };
      }
    } else {
      // Regular table handling
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId: table.id,
          date: new Date(date),
          time: time,
          status: { in: ['pending', 'confirmed'] }
        }
      });

      if (!existingReservation) {
        return table;
      }
    }
  }

  return null;
}

export async function POST(request) {
  try {
    // Public endpoint - no authentication required

    const data = await request.json();
    const { customerName, customerEmail, customerPhone, partySize, date, time, specialRequests, reservationType = 'normal' } = data;

    // Basic validation
    if (!customerName || !customerEmail || !customerPhone || !partySize || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert and validate party size
    const partySizeNum = parseInt(partySize, 10);
    if (isNaN(partySizeNum) || partySizeNum < 1) {
      return NextResponse.json({ error: 'Invalid party size. Must be a valid number greater than 0' }, { status: 400 });
    }

    // Find an available table that can accommodate the party and matches the reservation type
    let availableTable = await prisma.table.findFirst({
      where: {
        capacity: { gte: partySizeNum },
        isAvailable: true,
        tableType: reservationType === 'business' ? 'business' : 'standard'
      },
      orderBy: { capacity: 'asc' }
    });

    // If no matching table found, try to find any available table
    if (!availableTable) {
      availableTable = await findAvailableTable(partySizeNum, date, time);
    }
    
    if (!availableTable) {
      return NextResponse.json(
        { error: 'No suitable tables available for the requested time and party size' },
        { status: 400 }
      );
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        partySize: partySizeNum,
        date: new Date(date),
        time,
        specialRequests,
        tableId: availableTable.id,
        status: 'pending', // Public reservations start as pending
        reservationType
      }
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

// Update app/api/reservations/route.js
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            tableType: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Filter out any unexpected null tables (temporary safety)
    const validReservations = reservations.filter(r => !!r.table);

    return NextResponse.json(validReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reservations',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      }, 
      { status: 500 }
    );
  }
}
