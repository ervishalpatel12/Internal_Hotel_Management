export type RoomStatus = 'Clean & Available' | 'Occupied' | 'Dirty' | 'Inspecting' | 'Maintenance';

export type RoomType = 
  | 'Classic King' 
  | 'Deluxe Queen' 
  | 'Executive Suite' 
  | 'Presidential Suite' 
  | 'Garden Terrace Villa';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  currentGuest?: string;
  reservationId?: string;
  keyCardCode?: string;
  lastCleaned?: string;
  maintenanceIssue?: string;
}

export type ReservationStatus = 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
export type PaymentStatus = 'Paid in Full' | 'Deposit Paid' | 'Due on Arrival';

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  idVerified?: boolean;
  keyCardIssued?: boolean;
  folioBalance: number;
  createdAt: string;
}

export type MaintenanceCategory = 
  | 'HVAC & Climate' 
  | 'Plumbing' 
  | 'Electrical' 
  | 'Door & RFID Lock' 
  | 'Furniture & Fixture' 
  | 'Audio & TV';

export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: TicketStatus;
  reportedBy: string;
  assignedStaffName: string;
  createdAt: string;
  resolutionNotes?: string;
}

export type Department = 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Management' | 'Concierge';
export type DutyStatus = 'On Duty' | 'On Break' | 'Off Duty';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  shift: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)';
  status: DutyStatus;
  phone: string;
  email: string;
  avatarBg: string;
  assignedZone: string;
  activeTasksCount: number;
}

export interface BackendSyncEvent {
  id: string;
  timestamp: string;
  module: string;
  endpoint: string;
  action: string;
  statusText: string;
}
