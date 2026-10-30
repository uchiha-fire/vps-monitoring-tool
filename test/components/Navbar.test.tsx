// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../../src/renderer/src/components/Navbar';

describe('Navbar Component (TDD)', () => {
  it('should render brand and disconnected state', () => {
    render(
      <Navbar
        connectionState={{ status: 'disconnected' }}
        onOpenConnectModal={vi.fn()}
        onDisconnect={vi.fn()}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />
    );

    expect(screen.getByText('DockMon')).toBeDefined();
    expect(screen.getByText(/Disconnected/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Connect to VPS/i })).toBeDefined();
  });

  it('should render SSH Guide button and handle click', () => {
    const onOpenGuideMock = vi.fn();
    render(
      <Navbar
        connectionState={{ status: 'disconnected' }}
        onOpenConnectModal={vi.fn()}
        onOpenGuideModal={onOpenGuideMock}
        onDisconnect={vi.fn()}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />
    );

    const guideBtn = screen.getByRole('button', { name: /SSH Guide/i });
    expect(guideBtn).toBeDefined();
    fireEvent.click(guideBtn);
    expect(onOpenGuideMock).toHaveBeenCalledTimes(1);
  });

  it('should render connected status badge when connected', () => {
    render(
      <Navbar
        connectionState={{
          status: 'connected',
          currentHost: 'example.com',
          currentPort: 22,
          currentUsername: 'root',
        }}
        onOpenConnectModal={vi.fn()}
        onDisconnect={vi.fn()}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />
    );

    expect(screen.getByText(/root@example.com:22/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Disconnect/i })).toBeDefined();
  });
});
