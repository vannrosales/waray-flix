import { describe, it, expect } from 'vitest';
import {
  getReleaseYear,
  getMediaTitle,
  formatRating,
  formatDuration,
  formatPlaybackTime,
  calculateProgress,
  normalizeMedia,
} from '../utils/formatters';

describe('formatters.js utility functions', () => {
  describe('getReleaseYear', () => {
    it('extracts year from release_date', () => {
      expect(getReleaseYear({ release_date: '2024-05-12' })).toBe('2024');
    });

    it('extracts year from first_air_date', () => {
      expect(getReleaseYear({ first_air_date: '2019-11-12' })).toBe('2019');
    });

    it('returns fallback if date is missing or invalid', () => {
      expect(getReleaseYear({})).toBe('2026');
      expect(getReleaseYear(null, 'TBA')).toBe('TBA');
    });
  });

  describe('getMediaTitle', () => {
    it('returns title when available', () => {
      expect(getMediaTitle({ title: 'Oppenheimer' })).toBe('Oppenheimer');
    });

    it('returns name for TV shows', () => {
      expect(getMediaTitle({ name: 'Stranger Things' })).toBe('Stranger Things');
    });

    it('falls back to fallback string when title is missing', () => {
      expect(getMediaTitle({}, 'Untitled Film')).toBe('Untitled Film');
      expect(getMediaTitle(null)).toBe('Untitled');
    });
  });

  describe('formatRating', () => {
    it('formats rating to 1 decimal place', () => {
      expect(formatRating(8.74)).toBe('8.7');
      expect(formatRating('7.5')).toBe('7.5');
    });

    it('returns null for zero or invalid ratings', () => {
      expect(formatRating(0)).toBeNull();
      expect(formatRating(null)).toBeNull();
      expect(formatRating('N/A')).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(142)).toBe('2h 22m');
    });

    it('formats exact hours', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('formats minutes under an hour', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('returns null for zero or negative values', () => {
      expect(formatDuration(0)).toBeNull();
      expect(formatDuration(-10)).toBeNull();
    });
  });

  describe('formatPlaybackTime', () => {
    it('formats mm:ss for times under an hour', () => {
      expect(formatPlaybackTime(125)).toBe('02:05');
      expect(formatPlaybackTime(0)).toBe('00:00');
    });

    it('formats hh:mm:ss for times over an hour', () => {
      expect(formatPlaybackTime(3665)).toBe('1:01:05');
    });
  });

  describe('calculateProgress', () => {
    it('calculates completion percentage rounded to integer', () => {
      expect(calculateProgress(300, 600)).toBe(50);
      expect(calculateProgress(1, 3)).toBe(33);
    });

    it('clamps to max 100%', () => {
      expect(calculateProgress(7500, 7200)).toBe(100);
    });

    it('returns 0 for zero or negative total', () => {
      expect(calculateProgress(100, 0)).toBe(0);
    });
  });

  describe('normalizeMedia', () => {
    it('normalizes movie object correctly', () => {
      const normalized = normalizeMedia({
        id: 99,
        title: 'Interstellar',
        poster_path: '/poster.jpg',
        vote_average: 8.6,
        release_date: '2014-11-07',
      });

      expect(normalized).toEqual({
        id: 99,
        media_id: '99',
        title: 'Interstellar',
        name: 'Interstellar',
        poster_path: '/poster.jpg',
        backdrop_path: '',
        media_type: 'movie',
        vote_average: 8.6,
        release_date: '2014-11-07',
        overview: '',
      });
    });

    it('normalizes TV object correctly based on first_air_date', () => {
      const normalized = normalizeMedia({
        id: 101,
        name: 'Severance',
        first_air_date: '2022-02-18',
      });

      expect(normalized.media_type).toBe('tv');
      expect(normalized.title).toBe('Severance');
    });
  });
});

