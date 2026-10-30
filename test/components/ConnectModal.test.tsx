// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectModal } from '../../src/renderer/src/components/ConnectModal';

describe('ConnectModal Component (TDD)', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConnectModal
        isOpen={false}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true and display default ssh command', () => {
    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText(/Connect to Remote VPS/i)).toBeDefined();
    expect(screen.getByDisplayValue(/ssh root@192.168.1.100/i)).toBeDefined();
  });

  it('should parse raw SSH command and show preview in real time', () => {
    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByDisplayValue(/ssh root@192.168.1.100/i);
    fireEvent.change(input, { target: { value: 'ssh -p 2222 ubuntu@ec2-test.com' } });

    expect(screen.getByText('ec2-test.com')).toBeDefined();
    expect(screen.getByText('2222')).toBeDefined();
    expect(screen.getByText('ubuntu')).toBeDefined();
  });

  it('should trigger onConnect callback with parsed credentials on form submit', async () => {
    const onConnectMock = vi.fn().mockResolvedValue(undefined);

    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={onConnectMock}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );

    const connectButton = screen.getByRole('button', { name: /Connect/i });
    fireEvent.click(connectButton);

    expect(onConnectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: '192.168.1.100',
        username: 'root',
        port: 22,
      }),
      undefined
    );
  });

  it('should navigate between Step 1 (Destination) and Step 2 (Authentication)', () => {
    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );

    // Initial state: Step 1
    expect(screen.getByText(/Step 1/i)).toBeDefined();
    expect(screen.getByText(/SSH Command/i)).toBeDefined();

    // Click Next: Authentication
    const nextButton = screen.getByRole('button', { name: /Next|Configure Auth/i });
    fireEvent.click(nextButton);

    // Now in Step 2: Authentication
    expect(screen.getByText(/Step 2/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Back/i })).toBeDefined();

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText(/Step 1/i)).toBeDefined();
  });

  it('should hide password field and show passphrase field when SSH key is parsed from command', () => {
    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByDisplayValue(/ssh root@192.168.1.100/i);
    fireEvent.change(input, {
      target: { value: 'ssh -i ~/.ssh/id_ed25519_sample -p 2200 admin@example.com' },
    });

    // Step 1 indicates key is detected
    expect(screen.getAllByText(/id_ed25519_sample/i).length).toBeGreaterThan(0);

    // Advance to Step 2
    const nextButton = screen.getByRole('button', { name: /Next|Configure Auth|Options/i });
    fireEvent.click(nextButton);

    // In Step 2, Private key should be displayed
    expect(screen.getByText(/~[/\\]\.ssh[/\\]id_ed25519_sample/i)).toBeDefined();
    // Passphrase input should exist
    expect(screen.getByPlaceholderText(/passphrase/i)).toBeDefined();
    // Password field should NOT be rendered when private key is present
    expect(screen.queryByPlaceholderText(/enter password/i)).toBeNull();
  });

  it('should allow direct connect from Step 1 when SSH key is parsed from command', async () => {
    const onConnectMock = vi.fn().mockResolvedValue(undefined);

    render(
      <ConnectModal
        isOpen={true}
        onClose={vi.fn()}
        onConnect={onConnectMock}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByDisplayValue(/ssh root@192.168.1.100/i);
    fireEvent.change(input, {
      target: { value: 'ssh -i ~/.ssh/id_rsa user@vps.sample.org' },
    });

    // When key is present, "Connect Now" should be available right from Step 1
    const directConnectBtn = screen.getByRole('button', { name: /Connect Now/i });
    fireEvent.click(directConnectBtn);

    expect(onConnectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'vps.sample.org',
        username: 'user',
        port: 22,
        privateKey: '~/.ssh/id_rsa',
      }),
      undefined
    );
  });

  it('should call onOpenGuide when guide button in ConnectModal is clicked', () => {
    const onOpenGuideMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <ConnectModal
        isOpen={true}
        onClose={onCloseMock}
        onConnect={vi.fn()}
        profiles={[]}
        onDeleteProfile={vi.fn()}
        isLoading={false}
        onOpenGuide={onOpenGuideMock}
      />
    );

    const guideButtons = screen.getAllByRole('button', { name: /SSH Guide/i });
    expect(guideButtons.length).toBeGreaterThan(0);
    fireEvent.click(guideButtons[0]);

    expect(onCloseMock).toHaveBeenCalled();
    expect(onOpenGuideMock).toHaveBeenCalled();
  });
});
