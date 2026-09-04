import assert from 'node:assert/strict';
import test from 'node:test';

import { filterPublishedEducation, validateEducationContent } from './education.validation.ts';

const baseInput = {
  title: 'Hand hygiene at home',
  summary: 'Simple hygiene reminders for everyday support.',
  body: 'Wash hands before and after providing support.',
  type: 'article',
  imageUrl: null,
  videoUrl: null,
  published: true,
};

test('filters education content to published items', () => {
  assert.equal(filterPublishedEducation([{ published: true }, { published: false }]).length, 1);
});

test('rejects an invalid title and URL', () => {
  assert.equal(validateEducationContent({ ...baseInput, title: ' ' }), 'Please enter a title.');
  assert.equal(
    validateEducationContent({ ...baseInput, imageUrl: 'not-a-url' }),
    'Enter a valid image URL.',
  );
});

test('accepts valid article and video content', () => {
  assert.equal(validateEducationContent(baseInput), null);
  assert.equal(
    validateEducationContent({
      ...baseInput,
      type: 'video',
      videoUrl: 'https://example.com/care.mp4',
    }),
    null,
  );
});
