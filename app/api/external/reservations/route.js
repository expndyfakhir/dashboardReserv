import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// Validate the reservation data
function validateReservationData(data) {
  const errors = [];
  if (!data.customerName) errors.push('Customer name is required');
  if (!data.customerEmail) errors.push('Customer email is required');
  if (!data.customerPhone) errors.push('Customer phone is required');
  if (!data.partySize || data.partySize < 1) errors.push('Valid party size is required');
  if (!data.date) errors.push('Date is required');
  if (!data.time) errors.push('Time is required');
  return errors;
}

// Handle external reservation requests
export async function POST(request) {
  try {
    // Check origin
    const origin = request.headers.get('origin');
    if (origin !== 'https://m-arrakech.com') {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate the incoming data
    const validationErrors = validateReservationData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // Find available tables for the given party size
    const availableTables = await prisma.table.findMany({
      where: {
        capacity: { gte: data.partySize },
        isAvailable: true
      },
      orderBy: { capacity: 'asc' }
    });

    if (!availableTables.length) {
      return NextResponse.json(
        { error: 'No available tables for the specified party size' },
        { status: 400 }
      );
    }

    // Create the reservation with the first available table
    const reservation = await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        partySize: data.partySize,
        date: new Date(data.date),
        time: data.time,
        specialRequests: data.specialRequests || '',
        status: 'pending',
        tableId: availableTables[0].id,
        reservationType: 'external'
      }
    });

    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': 'https://m-arrakech.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    return NextResponse.json(reservation, { headers });
  } catch (error) {
    console.error('External reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': 'https://m-arrakech.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}