import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDisasters = async (req: AuthRequest, res: Response) => {
  try {
    const { type, severity, status, search } = req.query;

    const where: any = {};

    if (type && typeof type === 'string') where.type = type;
    if (severity && typeof severity === 'string') where.severity = severity;
    if (status && typeof status === 'string') where.status = status;

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const disasters = await prisma.disaster.findMany({
      where,
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true },
        },
        assignments: {
          include: {
            responder: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: disasters.length,
      disasters,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDisasterById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const disaster = await prisma.disaster.findUnique({
      where: { id },
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true, phone: true },
        },
        reports: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            responder: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster event not found.' });
    }

    return res.status(200).json({
      success: true,
      disaster,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, severity, location, latitude, longitude, status } = req.body;

    if (!title || !description || !type || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, type, and location are required.' });
    }

    const disaster = await prisma.disaster.create({
      data: {
        title,
        description,
        type,
        severity: severity || 'Medium',
        location,
        latitude: latitude ? parseFloat(latitude) : 37.7749,
        longitude: longitude ? parseFloat(longitude) : -122.4194,
        status: status || 'Pending',
        reportedById: req.user?.userId || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Disaster incident reported successfully.',
      disaster,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, severity, location, latitude, longitude, status } = req.body;

    const existing = await prisma.disaster.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disaster record not found.' });
    }

    const updated = await prisma.disaster.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(type && { type }),
        ...(severity && { severity }),
        ...(location && { location }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(status && { status }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Disaster record updated successfully.',
      disaster: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDisaster = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.disaster.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disaster record not found.' });
    }

    await prisma.disaster.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Disaster record deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
