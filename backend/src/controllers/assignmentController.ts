import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, disasterId, responderId } = req.query;

    const where: any = {};

    if (status && typeof status === 'string') where.status = status;
    if (disasterId && typeof disasterId === 'string') where.disasterId = disasterId;
    if (responderId && typeof responderId === 'string') where.responderId = responderId;

    // If logged in as RESPONDER, by default filter to their assignments unless specified
    if (req.user?.role === 'RESPONDER' && !responderId) {
      where.responderId = req.user.userId;
    }

    const assignments = await prisma.responseAssignment.findMany({
      where,
      include: {
        disaster: {
          select: {
            id: true,
            title: true,
            type: true,
            severity: true,
            location: true,
            latitude: true,
            longitude: true,
            status: true,
          },
        },
        responder: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.responseAssignment.findUnique({
      where: { id },
      include: {
        disaster: true,
        responder: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (req.user?.role === 'RESPONDER' && assignment.responderId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { disasterId, responderId, notes } = req.body;

    if (!disasterId || !responderId) {
      return res.status(400).json({ success: false, message: 'Disaster ID and Responder ID are required.' });
    }

    const disaster = await prisma.disaster.findUnique({ where: { id: disasterId } });
    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Target disaster incident not found.' });
    }

    const responder = await prisma.user.findUnique({ where: { id: responderId } });
    if (!responder || (responder.role !== 'RESPONDER' && responder.role !== 'ADMIN')) {
      return res.status(400).json({ success: false, message: 'Selected user is not an authorized emergency responder.' });
    }

    // Check if active assignment already exists
    const existing = await prisma.responseAssignment.findFirst({
      where: {
        disasterId,
        responderId,
        status: { in: ['Assigned', 'In Progress'] },
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Responder is already actively assigned to this disaster.' });
    }

    const assignment = await prisma.responseAssignment.create({
      data: {
        disasterId,
        responderId,
        notes: notes || 'Dispatched by emergency administration center.',
        status: 'Assigned',
      },
      include: {
        disaster: true,
        responder: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Update disaster status to Active if it was Pending
    if (disaster.status === 'Pending') {
      await prisma.disaster.update({
        where: { id: disasterId },
        data: { status: 'Active' },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Emergency responder ${responder.name} successfully dispatched to incident.`,
      assignment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // Status: 'Assigned', 'In Progress', 'Completed'

    const existing = await prisma.responseAssignment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assignment record not found.' });
    }

    // Responders can only update their own assigned tasks
    if (req.user?.role === 'RESPONDER' && existing.responderId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only update your own assigned tasks.' });
    }

    const completedAt = status === 'Completed' ? new Date() : existing.completedAt;

    const assignment = await prisma.responseAssignment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        completedAt,
      },
      include: {
        disaster: true,
        responder: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // If assignment completed, check if all assignments for this disaster are completed
    if (status === 'Completed') {
      const remainingActive = await prisma.responseAssignment.findMany({
        where: {
          disasterId: existing.disasterId,
          status: { in: ['Assigned', 'In Progress'] },
        },
      });

      if (remainingActive.length === 0) {
        await prisma.disaster.update({
          where: { id: existing.disasterId },
          data: { status: 'Resolved' },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Response status updated to '${status}'.`,
      assignment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
