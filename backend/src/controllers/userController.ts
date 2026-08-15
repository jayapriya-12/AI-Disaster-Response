import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        reports: {
          select: {
            id: true,
            description: true,
            status: true,
            createdAt: true,
          },
        },
        assignments: {
          select: {
            id: true,
            status: true,
            notes: true,
            disaster: {
              select: {
                id: true,
                title: true,
                type: true,
                severity: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
