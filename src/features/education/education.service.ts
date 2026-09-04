import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS, firestore } from '../../lib/firebase/firestore';
import type { EducationContent, EducationContentType } from '../../types/education';
import type { EducationContentInput } from './education.validation';

const educationCollection = collection(firestore, FIRESTORE_COLLECTIONS.educationContent);

export type EducationServiceErrorCode = 'education-not-found' | 'invalid-education-content';

export class EducationServiceError extends Error {
  public constructor(
    public readonly code: EducationServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'EducationServiceError';
  }
}

type TimestampValue = { readonly toDate: () => Date };

function readTimestamp(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('toDate' in value)) return null;
  const timestamp = value as TimestampValue;
  return typeof timestamp.toDate === 'function' ? timestamp.toDate().toISOString() : null;
}

function readEducationContent(id: string, value: unknown): EducationContent | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  const createdAt = readTimestamp(data.createdAt);
  const updatedAt = readTimestamp(data.updatedAt);
  if (
    typeof data.title !== 'string' ||
    typeof data.summary !== 'string' ||
    typeof data.body !== 'string' ||
    (data.type !== 'article' && data.type !== 'video') ||
    (typeof data.imageUrl !== 'string' && data.imageUrl !== null) ||
    (typeof data.videoUrl !== 'string' && data.videoUrl !== null) ||
    typeof data.published !== 'boolean' ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }
  return {
    id,
    title: data.title,
    summary: data.summary,
    body: data.body,
    type: data.type as EducationContentType,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    published: data.published,
    createdAt,
    updatedAt,
  };
}

function contentFields(input: EducationContentInput) {
  return {
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    type: input.type,
    imageUrl: input.imageUrl?.trim() || null,
    videoUrl: input.videoUrl?.trim() || null,
    published: input.published,
  };
}

function requireContent(input: EducationContentInput): ReturnType<typeof contentFields> {
  const fields = contentFields(input);
  if (!fields.title || !fields.summary || !fields.body) {
    throw new EducationServiceError('invalid-education-content', 'Education fields are required.');
  }
  return fields;
}

export async function listPublishedEducation(): Promise<EducationContent[]> {
  const snapshot = await getDocs(
    query(educationCollection, where('published', '==', true), orderBy('updatedAt', 'desc')),
  );
  return snapshot.docs.flatMap((item) => {
    const content = readEducationContent(item.id, item.data());
    return content === null ? [] : [content];
  });
}

export async function listAllEducation(): Promise<EducationContent[]> {
  const snapshot = await getDocs(query(educationCollection, orderBy('updatedAt', 'desc')));
  return snapshot.docs.flatMap((item) => {
    const content = readEducationContent(item.id, item.data());
    return content === null ? [] : [content];
  });
}

export async function getEducationContent(id: string): Promise<EducationContent | null> {
  const snapshot = await getDoc(doc(educationCollection, id));
  if (!snapshot.exists()) return null;
  return readEducationContent(snapshot.id, snapshot.data());
}

export async function createEducationContent(input: EducationContentInput): Promise<string> {
  const fields = requireContent(input);
  const reference = await addDoc(educationCollection, {
    ...fields,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateEducationContent(
  id: string,
  input: EducationContentInput,
): Promise<void> {
  await updateDoc(doc(educationCollection, id), {
    ...requireContent(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEducationContent(id: string): Promise<void> {
  await deleteDoc(doc(educationCollection, id));
}
