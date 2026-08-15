import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getResources = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, search } = req.query;

    const where: any = {};
    if (category && typeof category === 'string') where.category = category;
    if (status && typeof status === 'string') where.status = status;

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const resources = await prisma.reliefResource.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getResourceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await prisma.reliefResource.findUnique({ where: { id } });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createResource = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, quantity, unit, location, status } = req.body;

    if (!name || !category || quantity === undefined || !unit || !location) {
      return res.status(400).json({ success: false, message: 'Name, category, quantity, unit, and location are required.' });
    }

    const qty = parseInt(quantity, 10);
    const computedStatus = status || (qty === 0 ? 'OUT_OF_STOCK' : qty < 50 ? 'LOW' : 'AVAILABLE');

    const resource = await prisma.reliefResource.create({
      data: {
        name,
        category,
        quantity: qty,
        unit,
        location,
        status: computedStatus,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Relief resource added successfully.',
      resource,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, location, status } = req.body;

    const existing = await prisma.reliefResource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const qty = quantity !== undefined ? parseInt(quantity, 10) : existing.quantity;
    let computedStatus = status || existing.status;

    if (!status && quantity !== undefined) {
      computedStatus = qty === 0 ? 'OUT_OF_STOCK' : qty < 50 ? 'LOW' : 'AVAILABLE';
    }

    const resource = await prisma.reliefResource.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        quantity: qty,
        ...(unit && { unit }),
        ...(location && { location }),
        status: computedStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Relief resource updated successfully.',
      resource,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reliefResource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    await prisma.reliefResource.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Relief resource removed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
