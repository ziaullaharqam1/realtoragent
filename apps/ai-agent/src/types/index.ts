export type LightingPreset = 'golden-hour' | 'midday' | 'twilight';
export type RoomView = 'dollhouse' | 'living' | 'master' | 'terrace' | 'kitchen' | 'penthouse-pool';
export type FinishPalette = 'carrara-brass' | 'noir-matte' | 'french-oak' | 'brutalist-concrete';

export interface PropertyFinishes {
  flooring: string;
  cabinetry: string;
  accents: string;
}

export interface Hotspot {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
  category: 'architecture' | 'appliance' | 'view' | 'investment';
  spec: string;
}

export interface Property {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  neighborhood: string;
  priceAED: number;
  priceUSD: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  sqm: number;
  rentalYield: number; // e.g. 9.4%
  capitalAppreciation: number; // e.g. 14.2%
  status: 'Exclusive' | 'Off-Market' | 'Under Offer';
  coverImage: string;
  galleryImages: string[];
  keyUSPs: string[];
  vectorEmbeddingDims: number;
  architecturalStyle: string;
  completionDate: string;
  showToCustomers?: boolean;
  hotspots: Hotspot[];
}

export type PresentationDeckType = 'canva' | 'gamma';

export interface SlidePage {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  bullets: string[];
  statLabel?: string;
  statValue?: string;
  badge?: string;
  layout?: 'hero' | 'grid' | 'split' | 'callout';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export interface ClientBrief {
  clientName: string;
  companyOrFamily: string;
  phoneOrEmail: string;
  vipTier: 'Platinum UHNW' | 'Gold Investor' | 'Family Office' | 'First-Time Luxury Buyer';
  motive: 'Trophy Asset' | 'High ROI Rental Yield' | 'Golden Visa & Tax Relocation' | 'Holiday Beachfront Home';
  budgetMaxAED: number;
  buyingTimeline: 'Immediate (7-14 Days)' | 'Within 30 Days' | 'Next Quarter';
  pitchAngle: string;
  customNotes: string;
}

export interface Lead {
  id: string;
  name: string;
  source: 'Property Finder' | 'Bayut' | 'Dubizzle' | 'Houza' | 'WhatsApp Direct' | 'Dubai REST' | 'Instagram VIP' | 'Private Referral';
  phone: string;
  budgetAED: string;
  intentScore: number; // 0 - 100
  qualificationStage: 'Qualified Hot' | 'Viewing Requested' | 'Offer Drafting' | 'Nurture Drip';
  preferredArea: string;
  vectorSimilarity: number; // 0.98, etc.
  matchedProperty: string;
  lastMessageSnippet: string;
  timestamp: string;
  assignedBroker: string;
}

export interface ApprovalDraft {
  id: string;
  leadId: string;
  leadName: string;
  channel: 'WhatsApp' | 'SMS' | 'Telegram';
  triggerEvent: string;
  incomingQuery: string;
  aiSuggestedReply: string;
  confidenceScore: number;
  propertyContext: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'broker' | 'ai-shadow';
  text: string;
  time: string;
  isApprovalPending?: boolean;
}

export interface ConversationThread {
  id: string;
  contactName: string;
  channel: 'WhatsApp' | 'Telegram' | 'Web Chat';
  phone: string;
  unreadCount: number;
  sentiment: 'High Excitement' | 'Cautious / Analytical' | 'Price Sensitive' | 'VIP Fast-Mover';
  brokerTakeover: boolean;
  propertyOfInterest: string;
  messages: ChatMessage[];
}

export interface NurtureSequence {
  id: string;
  leadName: string;
  campaign: string;
  stage: string;
  nextTouchpoint: string;
  channel: 'WhatsApp' | 'Email' | 'VIP Invite';
  active: boolean;
}

export interface UserPrincipal {
  email: string;
  displayName: string;
  role: 'Senior Managing Broker' | 'Admin' | 'Sales Director';
  brokerage: string;
  licenseNumber: string;
}
