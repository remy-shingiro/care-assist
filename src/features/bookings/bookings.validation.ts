import { isValidDate, isValidTimeRange } from '../assistants/availability';

export interface BookingRequestInput {
  readonly patientId: string;
  readonly preferredAssistantId: string;
  readonly hospitalName: string;
  readonly wardOrRoom: string | null;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly serviceDescription: string;
}

export function validateBookingRequest(input: BookingRequestInput): string | null {
  if (!input.patientId) return 'Your patient account could not be identified.';
  if (!input.preferredAssistantId) return 'Select a preferred assistant.';
  if (input.hospitalName.trim().length < 2) return 'Enter the service location.';
  if (!isValidDate(input.date)) return 'Enter a valid request date.';
  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return 'End time must be later than start time.';
  }
  if (input.serviceDescription.trim().length < 5) return 'Describe the support you need.';
  return null;
}
