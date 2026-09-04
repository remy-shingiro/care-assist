export type EducationContentType = 'article' | 'video';

export interface EducationContent {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly type: EducationContentType;
  readonly imageUrl: string | null;
  readonly videoUrl: string | null;
  readonly published: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
