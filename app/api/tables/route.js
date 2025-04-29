import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all tables
    const tables = await prisma.table.findMany({
      orderBy: {
        tableNumber: 'asc'
      }
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { message: 'Error fetching tables' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tableNumber, capacity, isDivisible = false, tableType = 'normal' } = body;

    // Validate input
    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { message: 'Table number and capacity are required' },
        { status: 400 }
      );
    }

    // Convert to numbers and validate
    const tableNumberInt = parseInt(tableNumber);
    const capacityInt = parseInt(capacity);

    if (isNaN(tableNumberInt) || isNaN(capacityInt)) {
      return NextResponse.json(
        { message: 'Table number and capacity must be valid numbers' },
        { status: 400 }
      );
    }

    if (tableNumberInt < 1 || capacityInt < 1) {
      return NextResponse.json(
        { message: 'Table number and capacity must be positive numbers' },
        { status: 400 }
      );
    }

    // Validate table type
    if (!['normal', 'business', 'dinner'].includes(tableType)) {
      return NextResponse.json(
        { message: 'Invalid table type. Must be normal, business, or dinner' },
        { status: 400 }
      );
    }

    // Check if table number already exists
    const existingTable = await prisma.table.findUnique({
      where: { tableNumber: tableNumberInt }
    });

    if (existingTable) {
      return NextResponse.json(
        { message: 'Table number already exists' },
        { status: 400 }
      );
    }

    // Create new table
    const table = await prisma.table.create({
      data: {
        tableNumber: tableNumberInt,
        capacity: capacityInt,
        isAvailable: true,
        isDivisible: body.isDivisible || false,
        splitStatus: null,
        tableType: body.tableType || "normal"
      }
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { message: 'Error creating table' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Table ID is required' },
        { status: 400 }
      );
    }

    const deletedTable = await prisma.table.delete({
      where: { id: id }
    });

    return NextResponse.json({
      message: 'Table deleted successfully',
      table: deletedTable
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { message: 'Error deleting table', error: error.message },
      { status: 500 }
    );
  }
}