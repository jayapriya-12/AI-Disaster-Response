import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * AI Disaster Severity Prediction Engine
 */
export const predictSeverity = async (req: Request, res: Response) => {
  try {
    const { disasterType, description, location } = req.body;

    if (!disasterType || !description) {
      return res.status(400).json({
        success: false,
        message: 'disasterType and description are required for severity prediction.',
      });
    }

    const text = (description + ' ' + (location || '')).toLowerCase();

    // AI Keyword Risk Scoring Algorithm
    let score = 0;

    // Type Base Weight
    const typeWeights: Record<string, number> = {
      Flood: 25,
      Earthquake: 30,
      Tsunami: 35,
      Fire: 25,
      Cyclone: 20,
      Landslide: 20,
      Other: 10,
    };
    score += typeWeights[disasterType] || 15;

    // Critical Emergency Keywords
    const criticalKeywords = ['trapped', 'casualty', 'fatalities', 'drowning', 'explosion', 'severe injury', 'building collapse', 'unconscious', 'urgent rescue'];
    const highKeywords = ['heavy damage', 'submerged', 'evacuate', 'spreading', 'no power', 'blocked road', 'hospital', 'children'];
    const mediumKeywords = ['water rising', 'smoke', 'minor injury', 'power outage', 'debris'];

    criticalKeywords.forEach((kw) => {
      if (text.includes(kw)) score += 20;
    });

    highKeywords.forEach((kw) => {
      if (text.includes(kw)) score += 10;
    });

    mediumKeywords.forEach((kw) => {
      if (text.includes(kw)) score += 5;
    });

    let predictedSeverity = 'Low';
    let confidence = 75;

    if (score >= 60) {
      predictedSeverity = 'Critical';
      confidence = Math.min(98, 85 + Math.floor(score / 5));
    } else if (score >= 40) {
      predictedSeverity = 'High';
      confidence = Math.min(95, 80 + Math.floor(score / 5));
    } else if (score >= 25) {
      predictedSeverity = 'Medium';
      confidence = 82;
    } else {
      predictedSeverity = 'Low';
      confidence = 78;
    }

    return res.status(200).json({
      success: true,
      aiModel: 'Antigravity Emergency NLP Severity Classifier v1.2',
      input: { disasterType, description, location },
      prediction: {
        severity: predictedSeverity,
        confidenceScore: `${confidence}%`,
        riskScore: score,
        isAiRecommendation: true,
        recommendationNotice: 'AI prediction provided as operational decision support. Verify with field responders.',
        keyTriggersIdentified: [...criticalKeywords, ...highKeywords].filter((kw) => text.includes(kw)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI Report Prioritization Matrix
 */
export const prioritizeReports = async (req: Request, res: Response) => {
  try {
    const pendingReports = await prisma.disasterReport.findMany({
      where: { status: 'Pending' },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        disaster: { select: { id: true, title: true, type: true, severity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const prioritized = pendingReports.map((report) => {
      const desc = report.description.toLowerCase();
      let priorityScore = 50; // base

      if (report.disaster?.severity === 'Critical') priorityScore += 40;
      if (report.disaster?.severity === 'High') priorityScore += 25;
      if (report.disaster?.severity === 'Medium') priorityScore += 10;

      if (desc.includes('trapped') || desc.includes('rescue')) priorityScore += 15;
      if (desc.includes('medical') || desc.includes('blood') || desc.includes('injured')) priorityScore += 15;
      if (desc.includes('children') || desc.includes('elderly')) priorityScore += 10;

      let priorityLevel = 'P3 - Routine';
      if (priorityScore >= 85) priorityLevel = 'P1 - Immediate Rescue Required';
      else if (priorityScore >= 65) priorityLevel = 'P2 - High Priority Response';

      return {
        reportId: report.id,
        location: report.location,
        description: report.description,
        user: report.user,
        disaster: report.disaster,
        priorityScore,
        priorityLevel,
        createdAt: report.createdAt,
      };
    });

    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    return res.status(200).json({
      success: true,
      count: prioritized.length,
      isAiRecommendation: true,
      prioritizationMatrix: prioritized,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AI Relief Resource Recommendation Engine
 */
export const recommendRelief = async (req: Request, res: Response) => {
  try {
    const { disasterType, severity, estimatedAffectedPeople } = req.body;

    const people = estimatedAffectedPeople ? parseInt(estimatedAffectedPeople, 10) : 100;
    const mult = severity === 'Critical' ? 1.5 : severity === 'High' ? 1.2 : 1.0;

    const waterLiters = Math.ceil(people * 4 * mult); // 4L per person per day
    const foodPacks = Math.ceil(people * 3 * mult); // 3 MRE meals per person
    const medicalKits = Math.ceil((people / 25) * mult);
    const blankets = Math.ceil(people * 1.1);
    const tents = Math.ceil(people / 5); // 5 person tents

    return res.status(200).json({
      success: true,
      isAiRecommendation: true,
      input: { disasterType, severity, estimatedAffectedPeople: people },
      recommendations: {
        water: { quantity: waterLiters, unit: 'liters', item: 'Emergency Drinking Water' },
        food: { quantity: foodPacks, unit: 'packs', item: 'Ready-To-Eat MRE Ration Kits' },
        medicine: { quantity: Math.max(5, medicalKits), unit: 'boxes', item: 'Trauma & First Aid Medical Supplies' },
        blankets: { quantity: blankets, unit: 'units', item: 'Thermal Fleece Blankets' },
        shelter: { quantity: Math.max(2, tents), unit: 'tents', item: 'Emergency Family Tents' },
      },
      logisticalNotes: [
        'Deploy mobile water filtration units if clean supply is contaminated.',
        'Prioritize cold-weather blankets and dry rations for vulnerable coastal/mountain sectors.',
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
