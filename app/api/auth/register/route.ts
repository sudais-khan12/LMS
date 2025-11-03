import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  // Optional fields for role-specific data
  enrollmentNo: z.string().optional(),
  semester: z.number().int().min(1).max(10).optional(),
  section: z.string().optional(),
  specialization: z.string().optional(),
  contact: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user with role-specific data
    if (validatedData.role === Role.STUDENT) {
      if (!validatedData.enrollmentNo || !validatedData.semester || !validatedData.section) {
        return NextResponse.json(
          {
            success: false,
            message: 'Enrollment number, semester, and section are required for students',
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: Role.STUDENT,
          student: {
            create: {
              enrollmentNo: validatedData.enrollmentNo,
              semester: validatedData.semester,
              section: validatedData.section,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Student registered successfully',
          data: user,
        },
        { status: 201 }
      );
    }

    if (validatedData.role === Role.TEACHER) {
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: Role.TEACHER,
          teacher: {
            create: {
              specialization: validatedData.specialization || null,
              contact: validatedData.contact || null,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Teacher registered successfully',
          data: user,
        },
        { status: 201 }
      );
    }

    if (validatedData.role === Role.ADMIN) {
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: Role.ADMIN,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Admin registered successfully',
          data: user,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid role',
      },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

