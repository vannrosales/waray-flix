import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { subtitleService, SUBTITLE_LANGUAGES } from '../services/subtitleService';
import SubtitleSwitcher from '../components/player/SubtitleSwitcher';
import { CONFIG } from '../config/siteConfig';

describe('subtitleService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults preferred subtitle language to English ("en")', () => {
    expect(subtitleService.getPreferredLanguage()).toBe('en');
  });

  it('persists and retrieves preferred language in localStorage', () => {
    subtitleService.setPreferredLanguage('es');
    expect(localStorage.getItem('warayflix_subtitle_lang')).toBe('es');
    expect(subtitleService.getPreferredLanguage()).toBe('es');
  });

  it('generates accurate query parameters including subtitles by default', () => {
    const query = subtitleService.buildPlayerQueryParams(120, 'en');
    expect(query).toContain('t=120');
    expect(query).toContain('sub=en');
    expect(query).toContain('subtitle=true');
    expect(query).toContain('cc=1');
  });

  it('generates subtitle disabling parameters when lang is "off"', () => {
    const query = subtitleService.buildPlayerQueryParams(0, 'off');
    expect(query).toContain('sub=none');
    expect(query).toContain('subtitle=false');
    expect(query).toContain('cc=0');
  });

  it('formats player URLs with subtitle parameters from CONFIG.players', () => {
    const videasy = CONFIG.players.find(p => p.id === 'videasy');
    expect(videasy).toBeDefined();

    const movieUrl = videasy.getMovieUrl(533535, 60, 'en');
    expect(movieUrl).toContain('https://player.videasy.to/movie/533535');
    expect(movieUrl).toContain('sub=en');
    expect(movieUrl).toContain('t=60');

    const tvUrl = videasy.getTvUrl(1396, 1, 1, 0, 'es');
    expect(tvUrl).toContain('https://player.videasy.to/tv/1396/1/1');
    expect(tvUrl).toContain('sub=es');
  });
});

describe('SubtitleSwitcher Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders active subtitle badge with language code', () => {
    render(<SubtitleSwitcher subtitleLang="en" onSelectSubtitle={() => {}} />);
    expect(screen.getByText(/CC: EN/i)).toBeInTheDocument();
  });

  it('opens language dropdown menu when clicked', () => {
    render(<SubtitleSwitcher subtitleLang="en" onSelectSubtitle={() => {}} />);
    const button = screen.getByRole('button', { name: /subtitles and captions/i });
    fireEvent.click(button);

    expect(screen.getByText(/Subtitles & Captions/i)).toBeInTheDocument();
    expect(screen.getByText(/Spanish/i)).toBeInTheDocument();
    expect(screen.getByText(/French/i)).toBeInTheDocument();
  });

  it('calls onSelectSubtitle and persists when a language is selected', () => {
    let selected = null;
    render(
      <SubtitleSwitcher
        subtitleLang="en"
        onSelectSubtitle={(code) => { selected = code; }}
      />
    );

    const button = screen.getByRole('button', { name: /subtitles and captions/i });
    fireEvent.click(button);

    const spanishOption = screen.getByText(/Spanish/i);
    fireEvent.click(spanishOption);

    expect(selected).toBe('es');
    expect(subtitleService.getPreferredLanguage()).toBe('es');
  });
});
