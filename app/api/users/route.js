import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all admin users
    const admins = await prisma.users.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { message: 'Error fetching admins' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, password, firstName, lastName, role } = body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'All fields (username, email, password, firstName, lastName) are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Set default role to ADMIN if not specified
    const userRole = role || 'ADMIN';

    // Validate role
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be ADMIN or SUPER_ADMIN' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.users.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: userRole,
        isActive: true
      }
    });

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return NextResponse.json(adminWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: 'Error creating admin' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    // Validate input
    if (!id || !action || !['ban', 'unban'].includes(action)) {
      return NextResponse.json(
        { message: 'Valid ID and action (ban/unban) are required' },
        { status: 400 }
      );
    }

    // Update admin status
    const updatedAdmin = await prisma.users.update({
      where: { id },
      data: { isActive: action === 'unban' }
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { message: 'Error updating admin status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    // Validate input
    if (!id) {
      return NextResponse.json(
        { message: 'Valid ID is required' },
        { status: 400 }
      );
    }

    // Delete admin user
    const deletedAdmin = await prisma.users.delete({
      where: { id }
    });

    return NextResponse.json(deletedAdmin);
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { message: 'Error deleting admin' },
      { status: 500 }
    );
  }
}