export type AssistantType = 'professional' | 'general';

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
}

export interface AssistantUnavailablePeriod {
  readonly id: string;
  readonly assistantId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}
