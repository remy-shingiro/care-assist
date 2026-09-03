export type AssistantType = 'professional' | 'general';

export interface UnavailablePeriod {
  readonly id: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface Assistant {
  readonly id: string;
  readonly fullName: string;
  readonly type: AssistantType;
  readonly photoUrl: string | null;
  readonly phone: string;
  readonly bio: string;
  readonly experience: string;
  readonly services: readonly string[];
  readonly active: boolean;
  readonly unavailablePeriods: readonly UnavailablePeriod[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
