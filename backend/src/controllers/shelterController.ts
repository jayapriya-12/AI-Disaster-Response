import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getShelters = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') where.status = status;

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const shelters = await prisma.shelter.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      count: shelters.length,
      shelters,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getShelterById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const shelter = await prisma.shelter.findUnique({ where: { id } });

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    return res.status(200).json({
      success: true,
      shelter,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createShelter = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, latitude, longitude, capacity, currentOccupancy, contactNumber, status } = req.body;

    if (!name || !location || !capacity || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Name, location, capacity, and contact number are required.' });
    }

    const capNum = parseInt(capacity, 10);
    const occNum = currentOccupancy ? parseInt(currentOccupancy, 10) : 0;
    const computedStatus = status || (occNum >= capNum ? 'FULL' : 'OPEN');

    const shelter = await prisma.shelter.create({
      data: {
        name,
        location,
        latitude: latitude ? parseFloat(latitude) : 37.7749,
        longitude: longitude ? parseFloat(longitude) : -122.4194,
        capacity: capNum,
        currentOccupancy: occNum,
        contactNumber,
        status: computedStatus,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Shelter registered successfully.',
      shelter,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShelter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, latitude, longitude, capacity, currentOccupancy, contactNumber, status } = req.body;

    const existing = await prisma.shelter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    const capNum = capacity !== undefined ? parseInt(capacity, 10) : existing.capacity;
    const occNum = currentOccupancy !== undefined ? parseInt(currentOccupancy, 10) : existing.currentOccupancy;
    let computedStatus = status || existing.status;

    if (!status && (capacity !== undefined || currentOccupancy !== undefined)) {
      computedStatus = occNum >= capNum ? 'FULL' : 'OPEN';
    }

    const shelter = await prisma.shelter.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        capacity: capNum,
        currentOccupancy: occNum,
        ...(contactNumber && { contactNumber }),
        status: computedStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Shelter updated successfully.',
      shelter,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteShelter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.shelter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Shelter not found.' });
    }

    await prisma.shelter.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Shelter removed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
