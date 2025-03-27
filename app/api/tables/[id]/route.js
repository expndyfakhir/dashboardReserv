import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(
  request,
  { params }
) {
  try {
    // Convert params to a regular object if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAvailable, capacity, tableType } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    // Validate input
    if (capacity && (isNaN(parseInt(capacity)) || parseInt(capacity) < 1)) {
      return NextResponse.json({ error: 'Invalid capacity value' }, { status: 400 });
    }
    
    if (tableType && !['normal', 'business', 'dinner'].includes(tableType)) {
      return NextResponse.json({ error: 'Invalid table type' }, { status: 400 });
    }

    // Update the table's properties
    const updatedTable = await prisma.table.update({
      where: { id: id },
      data: {
        isAvailable,
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(tableType && { tableType })
      }
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}