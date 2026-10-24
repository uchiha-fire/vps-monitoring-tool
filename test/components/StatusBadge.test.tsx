// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/renderer/src/components/StatusBadge';

describe('StatusBadge Component (TDD)', () => {
  it('should render green badge for running container', () => {
    render(<StatusBadge state="running" health="none" />);
    const badge = screen.getByText(/running/i);
    expect(badge).toBeDefined();
    expect(badge.className).toContain('text-emerald-400');
  });

  it('should render healthy tag when health is healthy', () => {
    render(<StatusBadge state="running" health="healthy" />);
    expect(screen.getByText(/healthy/i)).toBeDefined();
  });

  it('should render red badge for exited container', () => {
    render(<StatusBadge state="exited" health="none" />);
    const badge = screen.getByText(/exited/i);
    expect(badge).toBeDefined();
    expect(badge.className).toContain('text-rose-400');
  });

  it('should render yellow badge for restarting container', () => {
    render(<StatusBadge state="restarting" health="none" />);
    const badge = screen.getByText(/restarting/i);
    expect(badge).toBeDefined();
    expect(badge.className).toContain('text-amber-400');
  });
});
