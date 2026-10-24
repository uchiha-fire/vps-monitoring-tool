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
});
