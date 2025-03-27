import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Test connection by querying database version
    const result = await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      status: 'success',
      databaseVersion: result[0]?.version
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Connection failed',
        error: error.message
      },
      { status: 500 }
    );
  }
}