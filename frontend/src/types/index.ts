export type UserRole = 'ADMIN' | 'RESPONDER' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
}

export type DisasterType = 'Flood' | 'Cyclone' | 'Earthquake' | 'Fire' | 'Landslide' | 'Tsunami' | 'Other';
export type DisasterSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type DisasterStatus = 'Pending' | 'Verified' | 'Active' | 'Resolved' | 'Rejected';

export interface Disaster {
  id: string;
  title: string;
  description: string;
  type: DisasterType;
  severity: DisasterSeverity;
  location: string;
  latitude: number;
  longitude: number;
  status: DisasterStatus;
  reportedById?: string;
  createdAt: string;
  updatedAt: string;
  reportedBy?: Partial<User>;
  assignments?: ResponseAssignment[];
  _count?: {
    reports: number;
  };
}

export interface DisasterReport {
  id: string;
  disasterId?: string;
  userId: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  createdAt: string;
  user?: Partial<User>;
  disaster?: Partial<Disaster>;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  contactNumber: string;
  status: 'OPEN' | 'FULL' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface ReliefResource {
  id: string;
  name: string;
  category: 'Food' | 'Water' | 'Medicine' | 'Blankets' | 'Clothing' | 'Emergency Kits' | 'Other';
  quantity: number;
  unit: string;
  location: string;
  status: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface ResponseAssignment {
  id: string;
  disasterId: string;
  responderId: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  notes?: string;
  assignedAt: string;
  completedAt?: string;
  disaster?: Partial<Disaster>;
  responder?: Partial<User>;
}

export interface AiPrediction {
  severity: DisasterSeverity;
  confidenceScore: string;
  riskScore: number;
  isAiRecommendation: boolean;
  recommendationNotice: string;
  keyTriggersIdentified: string[];
}

export interface AiPrioritizationItem {
  reportId: string;
  location: string;
  description: string;
  user?: Partial<User>;
  disaster?: Partial<Disaster>;
  priorityScore: number;
  priorityLevel: string;
  createdAt: string;
}
