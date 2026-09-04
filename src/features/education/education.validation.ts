import type { EducationContentType } from '../../types/education';

export interface EducationContentInput {
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly type: EducationContentType;
  readonly imageUrl: string | null;
  readonly videoUrl: string | null;
  readonly published: boolean;
}

const isEducationContentType = (value: unknown): value is EducationContentType =>
  value === 'article' || value === 'video';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export function validateEducationContent(input: EducationContentInput): string | null {
  if (!isNonEmptyString(input.title)) return 'Please enter a title.';
  if (!isNonEmptyString(input.summary)) return 'Please enter a summary.';
  if (!isNonEmptyString(input.body)) return 'Please enter the education content.';
  if (!isEducationContentType(input.type)) return 'Choose a valid content type.';
  if (
    input.imageUrl !== null &&
    (!isNonEmptyString(input.imageUrl) || !isValidUrl(input.imageUrl))
  ) {
    return 'Enter a valid image URL.';
  }
  if (
    input.videoUrl !== null &&
    (!isNonEmptyString(input.videoUrl) || !isValidUrl(input.videoUrl))
  ) {
    return 'Enter a valid video URL.';
  }
  if (input.type === 'article' && input.videoUrl !== null) {
    return 'Articles cannot include a video URL.';
  }
  if (input.type === 'video' && !isNonEmptyString(input.videoUrl)) {
    return 'Video content requires a video URL.';
  }
  return null;
}

export function filterPublishedEducation<T extends { readonly published: boolean }>(
  content: readonly T[],
): T[] {
  return content.filter((item) => item.published);
}
