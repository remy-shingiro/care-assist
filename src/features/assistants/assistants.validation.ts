import type { AssistantType, UnavailablePeriod } from '../../types/assistant';
import { isValidDate, isValidTimeRange } from './availability';

export interface AssistantInput {
  readonly fullName: string;
  readonly type: AssistantType;
  readonly photoUrl: string | null;
  readonly phone: string;
  readonly bio: string;
  readonly experience: string;
  readonly services: readonly string[];
}

export function parseServices(value: string): string[] {
  return value
    .split(',')
    .map((service) => service.trim())
    .filter((service) => service.length > 0);
}

export function validateAssistantInput(input: AssistantInput): string | null {
  if (input.fullName.trim().length < 2) return 'Enter the assistant’s full name.';
  if (input.type !== 'professional' && input.type !== 'general') {
    return 'Choose a supported assistant type.';
  }
  if (!/^[+\d][\d ()-]{6,}$/.test(input.phone.trim())) return 'Enter a valid phone number.';
  if (input.bio.trim().length < 10) return 'Add a short, neutral bio.';
  if (input.experience.trim().length < 2) return 'Add the assistant’s experience.';
  if (input.services.length === 0) return 'Add at least one service.';
  if (input.photoUrl !== null && !/^https?:\/\//i.test(input.photoUrl)) {
    return 'Photo URL must start with http:// or https://.';
  }
  return null;
}

export function validateUnavailablePeriod(period: Omit<UnavailablePeriod, 'id'>): string | null {
  if (!isValidDate(period.date)) return 'Use a valid date in YYYY-MM-DD format.';
  if (!isValidTimeRange(period.startTime, period.endTime)) {
    return 'End time must be later than start time.';
  }
  return null;
}
