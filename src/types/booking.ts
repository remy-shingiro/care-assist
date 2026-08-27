export type BookingStatus =
  'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type ActiveBookingStatus = Extract<BookingStatus, 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS'>;

export interface Booking {
  readonly id: string;
  readonly patientId: string;
  readonly preferredAssistantId: string | null;
  readonly assignedAssistantId: string | null;
  readonly hospitalName: string;
  readonly wardOrRoom: string | null;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly serviceDescription: string;
  readonly status: BookingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
