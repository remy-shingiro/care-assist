export function isActiveBookingStatus(status: string): boolean {
  return status === 'PENDING' || status === 'CONFIRMED' || status === 'IN_PROGRESS';
}

export function isAllowedManagerTransition(currentStatus: string, nextStatus: string): boolean {
  return (
    (currentStatus === 'PENDING' && (nextStatus === 'CONFIRMED' || nextStatus === 'REJECTED')) ||
    (currentStatus === 'CONFIRMED' && nextStatus === 'CONFIRMED')
  );
}
