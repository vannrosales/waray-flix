import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TimelinePage from '../pages/TimelinePage';
import { FRANCHISE_TIMELINES } from '../constants/franchiseTimelines';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
  }),
}));

describe('TimelinePage & Franchise Timelines', () => {
  it('defines the Road to Avengers: Doomsday franchise timeline with essential items', () => {
    const doomsdayTimeline = FRANCHISE_TIMELINES.find(t => t.id === 'mcu-doomsday');
    expect(doomsdayTimeline).toBeDefined();
    expect(doomsdayTimeline.title).toBe('Road to Avengers: Doomsday');
    expect(doomsdayTimeline.items.length).toBeGreaterThan(5);
    expect(doomsdayTimeline.items.some(i => i.title === 'Avengers: Endgame')).toBe(true);
    expect(doomsdayTimeline.items.some(i => i.title.includes('Loki'))).toBe(true);
    expect(doomsdayTimeline.items.some(i => i.title === 'Avengers: Doomsday')).toBe(true);
  });

  it('renders countdown clock and progress gauge for MCU Doomsday', () => {
    render(
      <MemoryRouter initialEntries={['/timeline/mcu-doomsday']}>
        <Routes>
          <Route path="/timeline/:sagaId" element={<TimelinePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Road to Avengers: Doomsday')).toBeInTheDocument();
    expect(screen.getAllByText(/Watch Special Look Trailer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Your Progress/i)).toBeInTheDocument();
  });

  it('allows checking off items and updates watched checklist', () => {
    render(
      <MemoryRouter initialEntries={['/timeline/mcu-doomsday']}>
        <Routes>
          <Route path="/timeline/:sagaId" element={<TimelinePage />} />
        </Routes>
      </MemoryRouter>
    );

    const checkButtons = screen.getAllByTitle(/Mark as/i);
    expect(checkButtons.length).toBeGreaterThan(0);

    // Click to check the first item
    fireEvent.click(checkButtons[0]);
    expect(localStorage.getItem('warayflix_timeline_checks_mcu-doomsday')).toBeDefined();
  });

  it('filters items when phase filter pills are clicked', () => {
    render(
      <MemoryRouter initialEntries={['/timeline/mcu-doomsday']}>
        <Routes>
          <Route path="/timeline/:sagaId" element={<TimelinePage />} />
        </Routes>
      </MemoryRouter>
    );

    const mutantFilter = screen.getByText(/Mutant & Legacy Roots/i);
    fireEvent.click(mutantFilter);

    expect(screen.getByText('X-Men')).toBeInTheDocument();
    expect(screen.getByText('X2: X-Men United')).toBeInTheDocument();
  });
});

