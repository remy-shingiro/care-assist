export function isActiveBookingStatus(status: string): boolean {
  return status === 'PENDING' || status === 'CONFIRMED' || status === 'IN_PROGRESS';
}

export function isAllowedPatientTransition(currentStatus: string, nextStatus: string): boolean {
  return (
    (currentStatus === 'PENDING' && nextStatus === 'CANCELLED') ||
    (currentStatus === 'CONFIRMED' &&
      (nextStatus === 'CANCELLED' || nextStatus === 'IN_PROGRESS')) ||
    (currentStatus === 'IN_PROGRESS' && nextStatus === 'COMPLETED')
  );
}

export function isAllowedManagerCancellation(currentStatus: string, nextStatus: string): boolean {
  return currentStatus === 'CONFIRMED' && nextStatus === 'CANCELLED';
}

export function isAllowedManagerTransition(currentStatus: string, nextStatus: string): boolean {
  return (
    (currentStatus === 'PENDING' && (nextStatus === 'CONFIRMED' || nextStatus === 'REJECTED')) ||
    (currentStatus === 'CONFIRMED' && nextStatus === 'CONFIRMED')
  );
}
