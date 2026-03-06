import { prisma } from '../lib/prisma.js';
import { CreateUser, UpdateUser, PaginatedResponse } from '../types/user.js';
import { SyncUser, UpdateProfile } from '../types/auth.js';
import { User } from '@prisma/client';

export class UserService {
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByCognitoId(cognitoUserId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { cognitoUserId },
    });
  }

  /**
   * Creates or updates a user based on Cognito user ID.
   * Used for syncing user data from Cognito after authentication.
   */
  async syncUser(data: SyncUser): Promise<User> {
    return prisma.user.upsert({
      where: { cognitoUserId: data.cognitoUserId },
      update: {
        email: data.email,
        username: data.username,
        fullName: data.fullName,
      },
      create: {
        cognitoUserId: data.cognitoUserId,
        email: data.email,
        username: data.username,
        fullName: data.fullName,
      },
    });
  }

  /**
   * Updates user profile for an authenticated user
   */
  async updateProfile(cognitoUserId: string, data: UpdateProfile): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { cognitoUserId },
        data,
      });
    } catch {
      return null;
    }
  }

  async create(data: CreateUser): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
  }

  async update(id: string, data: UpdateUser): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
