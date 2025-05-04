import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['available', 'occupied'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be either "available" or "occupied".' },
        { status: 400 }
      );
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { isAvailable: status === 'available' }
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json(
      { message: 'Failed to update table status' },
      { status: 500 }
    );
  }
}