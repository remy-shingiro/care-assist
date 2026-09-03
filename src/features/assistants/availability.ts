import type { Assistant, UnavailablePeriod } from '../../types/assistant';

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function timeToMinutes(time: string): number | null {
  if (!timePattern.test(time)) return null;
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3, 5));
  return hours * 60 + minutes;
}

export function isValidDate(date: string): boolean {
  if (!datePattern.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toISOString().slice(0, 10) === date;
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return start !== null && end !== null && start < end;
}

export function periodsOverlap(
  requestedStart: string,
  requestedEnd: string,
  unavailableStart: string,
  unavailableEnd: string,
): boolean {
  const requestStart = timeToMinutes(requestedStart);
  const requestEnd = timeToMinutes(requestedEnd);
  const periodStart = timeToMinutes(unavailableStart);
  const periodEnd = timeToMinutes(unavailableEnd);

  if (requestStart === null || requestEnd === null || periodStart === null || periodEnd === null) {
    return false;
  }

  return requestStart < periodEnd && requestEnd > periodStart;
}

export function isAssistantAvailable(
  assistant: Pick<Assistant, 'active' | 'unavailablePeriods'>,
  requestedDate: string,
  requestedStart: string,
  requestedEnd: string,
): boolean {
  if (
    !assistant.active ||
    !isValidDate(requestedDate) ||
    !isValidTimeRange(requestedStart, requestedEnd)
  ) {
    return false;
  }

  return !assistant.unavailablePeriods.some(
    (period: UnavailablePeriod) =>
      period.date === requestedDate &&
      periodsOverlap(requestedStart, requestedEnd, period.startTime, period.endTime),
  );
}
