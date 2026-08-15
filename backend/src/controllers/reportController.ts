import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }

    // Standard USER can only see their own submitted reports
    if (req.user?.role === 'USER') {
      where.userId = req.user.userId;
    }

    const reports = await prisma.disasterReport.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        disaster: { select: { id: true, title: true, type: true, severity: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.disasterReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        disaster: true,
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (req.user?.role === 'USER' && report.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { disasterType, title, description, location, latitude, longitude, severity, imageUrl } = req.body;

    if (!description || !location) {
      return res.status(400).json({ success: false, message: 'Description and location are required.' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    // Automatically associate with an existing disaster or create a new pending disaster
    const disasterTitle = title || `${disasterType || 'Emergency'} at ${location}`;
    const disaster = await prisma.disaster.create({
      data: {
        title: disasterTitle,
        description,
        type: disasterType || 'Other',
        severity: severity || 'Medium',
        location,
        latitude: latitude ? parseFloat(latitude) : 37.7749,
        longitude: longitude ? parseFloat(longitude) : -122.4194,
        status: 'Pending',
        reportedById: userId,
      },
    });

    const report = await prisma.disasterReport.create({
      data: {
        disasterId: disaster.id,
        userId,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : 37.7749,
        longitude: longitude ? parseFloat(longitude) : -122.4194,
        imageUrl: imageUrl || null,
        status: 'Pending',
      },
      include: {
        disaster: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Disaster report submitted successfully to emergency response team.',
      report,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, severity } = req.body; // status: 'Verified' or 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Verified' or 'Rejected'." });
    }

    const report = await prisma.disasterReport.findUnique({
      where: { id },
      include: { disaster: true },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const updatedReport = await prisma.disasterReport.update({
      where: { id },
      data: { status },
    });

    if (report.disasterId) {
      const disasterStatus = status === 'Verified' ? 'Active' : 'Rejected';
      await prisma.disaster.update({
        where: { id: report.disasterId },
        data: {
          status: disasterStatus,
          ...(severity && { severity }),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report has been marked as ${status}.`,
      report: updatedReport,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
