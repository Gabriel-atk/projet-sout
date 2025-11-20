export interface TicketType {
  id: number;
  eventId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  quantitySold: number;
  isActive: boolean;
  isPopular: boolean;
  saleStartDate: string;
  saleEndDate: string;
  createdAt: string;
  updatedAt: string;
  features: string[];
  category: 'standard' | 'vip' | 'premium' | 'early_bird' | 'group';
}

export interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableTicketTypes: number[];
  eventId: number;
}

export interface TicketSale {
  id: number;
  ticketTypeId: number;
  eventId: number;
  participantId: number;
  participantName: string;
  participantEmail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  promoCodeUsed?: string;
  discountApplied: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: string;
  qrCode: string;
  isScanned: boolean;
  scannedAt?: string;
}

export interface TicketStatistics {
  eventId: number;
  totalTickets: number;
  ticketsSold: number;
  ticketsScanned: number;
  revenue: number;
  salesByType: { [ticketTypeId: number]: number };
  salesByDay: { date: string; count: number; revenue: number }[];
}
