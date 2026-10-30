// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SshGuideModal } from '../../src/renderer/src/components/SshGuideModal';

describe('SshGuideModal Component (TDD)', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SshGuideModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render guide modal with title and default Command Examples tab', () => {
    render(
      <SshGuideModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/SSH Connection Guide/i)).toBeDefined();
    // Default tab shows command syntax & examples
    expect(screen.getByText(/Command Examples/i)).toBeDefined();
    expect(screen.getByText(/Port Forwarding & Flags/i)).toBeDefined();
  });

  it('should switch between tabs: Command Examples, SSH Keys, and Troubleshooting', () => {
    render(
      <SshGuideModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Switch to SSH Keys tab
    const keysTabBtn = screen.getByRole('button', { name: /SSH Keys/i });
    fireEvent.click(keysTabBtn);
    expect(screen.getByText(/Finding & Generating Keys/i)).toBeDefined();
    expect(screen.getByText(/ssh-keygen/i)).toBeDefined();
    expect(screen.getAllByText(/~[/\\]\.ssh/i).length).toBeGreaterThan(0);

    // Switch to Troubleshooting tab
    const troubleshootingTabBtn = screen.getByRole('button', { name: /Troubleshooting/i });
    fireEvent.click(troubleshootingTabBtn);
    expect(screen.getByText(/Permission denied/i)).toBeDefined();
    expect(screen.getByText(/Connection timed out/i)).toBeDefined();
  });

  it('should call onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <SshGuideModal
        isOpen={true}
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close Guide/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should call onOpenConnectModal when action button is clicked', () => {
    const onOpenConnectMock = vi.fn();
    render(
      <SshGuideModal
        isOpen={true}
        onClose={vi.fn()}
        onOpenConnectModal={onOpenConnectMock}
      />
    );

    const connectActionBtn = screen.getByRole('button', { name: /Open Connect Modal/i });
    fireEvent.click(connectActionBtn);
    expect(onOpenConnectMock).toHaveBeenCalled();
  });
});
