import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { x, y } = await request.json();

    // Validate coordinates
    if (typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { message: 'Invalid coordinates. X and Y must be numbers.' },
        { status: 400 }
      );
    }

    // Update table position using Prisma
    const table = await prisma.table.update({
      where: { id },
      data: { x, y }
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table position:', error);
    return NextResponse.json(
      { message: 'Failed to update table position' },
      { status: 500 }
    );
  }
}