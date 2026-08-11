import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('concatenates class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('merges tailwind classes cleanly overriding conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('filters out falsy values', () => {
    const isActive = false;
    expect(cn('button', isActive && 'active', null, undefined, 'primary')).toBe('button primary');
  });
});
// Simple placeholder test for future references
