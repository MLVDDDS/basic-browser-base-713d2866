/**
 * 🧪 Chat Components Tests
 * Unit tests for UserMessage, AssistantMessage, SystemMessage, InputArea
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { SystemMessage } from '@/components/chat/SystemMessage';
import { InputArea } from '@/components/chat/InputArea';

type MotionProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionProps) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('UserMessage', () => {
  it('renders user message content', () => {
    render(<UserMessage content="Hello, AI!" />);
    expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
  });

  it('displays "Вы" label for user', () => {
    render(<UserMessage content="Test message" />);
    expect(screen.getByText('Вы')).toBeInTheDocument();
  });

  it('renders timestamp when provided', () => {
    const timestamp = new Date('2024-01-15T10:30:00').getTime();
    render(<UserMessage content="Message with time" timestamp={timestamp} />);
    // Check time format (HH:MM)
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it('does not render timestamp when not provided', () => {
    render(<UserMessage content="Message without time" />);
    const timeElements = screen.queryAllByText(/\d{2}:\d{2}/);
    expect(timeElements).toHaveLength(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <UserMessage content="Styled message" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles multiline content', () => {
    render(<UserMessage content="Line 1\nLine 2\nLine 3" />);
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
  });

  it('handles long messages without breaking layout', () => {
    const longMessage = 'A'.repeat(500);
    render(<UserMessage content={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special characters', () => {
    render(<UserMessage content="<script>alert('xss')</script>" />);
    // Should render as text, not execute
    expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    render(<UserMessage content="" />);
    // Should render without crashing
    expect(screen.getByText('Вы')).toBeInTheDocument();
  });

  it('handles emoji content', () => {
    render(<UserMessage content="Hello! 👋🎉✨" />);
    expect(screen.getByText(/Hello! 👋🎉✨/)).toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  it('renders assistant message content', () => {
    render(<AssistantMessage content="Hello, human!" />);
    expect(screen.getByText(/Hello, human!/)).toBeInTheDocument();
  });

  it('shows AI avatar by default', () => {
    const { container } = render(<AssistantMessage content="With avatar" />);
    // Check for gradient avatar (Sparkles icon)
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('hides avatar when showAvatar is false', () => {
    const { container } = render(
      <AssistantMessage content="No avatar" showAvatar={false} />
    );
    // Should not have the gradient avatar container
    const gradientAvatars = container.querySelectorAll('.from-purple-500');
    expect(gradientAvatars.length).toBe(0);
  });

  it('renders timestamp when provided', () => {
    const timestamp = new Date('2024-01-15T14:45:00').getTime();
    render(<AssistantMessage content="Timed message" timestamp={timestamp} />);
    expect(screen.getByText(/14:45/)).toBeInTheDocument();
  });

  it('renders bold text with **markdown**', () => {
    render(<AssistantMessage content="This is **bold** text" />);
    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('renders bullet points', () => {
    render(<AssistantMessage content="List:\n• Item one\n• Item two" />);
    expect(screen.getByText(/Item one/)).toBeInTheDocument();
    expect(screen.getByText(/Item two/)).toBeInTheDocument();
  });

  it('handles emoji headers', () => {
    render(<AssistantMessage content="💡 Tip: Use semantic colors" />);
    expect(screen.getByText(/💡 Tip/)).toBeInTheDocument();
  });

  it('handles inline code with backticks', () => {
    render(<AssistantMessage content="Use `npm install` command" />);
    const codeElement = screen.getByText('npm install');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AssistantMessage content="Styled" className="custom-assistant" />
    );
    expect(container.firstChild).toHaveClass('custom-assistant');
  });
});

describe('SystemMessage', () => {
  it('renders error message with correct styling', () => {
    render(
      <SystemMessage 
        type="error" 
        title="Error" 
        message="Something went wrong" 
      />
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(
      <SystemMessage 
        type="warning" 
        title="Warning" 
        message="Be careful" 
      />
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('renders info message', () => {
    render(
      <SystemMessage 
        type="info" 
        title="Info" 
        message="FYI" 
      />
    );
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders success message', () => {
    render(
      <SystemMessage 
        type="success" 
        title="Success" 
        message="Operation completed" 
      />
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('renders limit message', () => {
    render(
      <SystemMessage 
        type="limit" 
        title="Limit Reached" 
        message="You have reached your token limit" 
      />
    );
    expect(screen.getByText('Limit Reached')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn();
    render(
      <SystemMessage 
        type="info" 
        title="Dismissible" 
        message="Click X to close" 
        onDismiss={onDismiss}
      />
    );
    
    const dismissButton = screen.getByRole('button');
    await userEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when onDismiss not provided', () => {
    render(
      <SystemMessage 
        type="info" 
        title="No Dismiss" 
        message="Cannot be closed" 
      />
    );
    
    // Only action button if present, no dismiss X
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('renders action button when provided', async () => {
    const onClick = vi.fn();
    render(
      <SystemMessage 
        type="warning" 
        title="Action Required" 
        message="Click to fix" 
        action={{ label: 'Fix Now', onClick }}
      />
    );
    
    const actionButton = screen.getByText('Fix Now');
    await userEvent.click(actionButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders timestamp', () => {
    const timestamp = new Date('2024-01-15T16:00:00').getTime();
    render(
      <SystemMessage 
        type="info" 
        title="Timed" 
        message="With timestamp" 
        timestamp={timestamp}
      />
    );
    expect(screen.getByText(/16:00/)).toBeInTheDocument();
  });

  it('applies different background colors for each type', () => {
    const { rerender, container } = render(
      <SystemMessage type="error" title="E" message="M" />
    );
    expect(container.firstChild).toHaveClass('bg-destructive/10');

    rerender(<SystemMessage type="warning" title="W" message="M" />);
    expect(container.firstChild).toHaveClass('bg-amber-500/10');

    rerender(<SystemMessage type="success" title="S" message="M" />);
    expect(container.firstChild).toHaveClass('bg-green-500/10');
  });
});

describe('InputArea', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnStop: ReturnType<typeof vi.fn>;
  let mockOnToggleRecording: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSubmit = vi.fn();
    mockOnStop = vi.fn();
    mockOnToggleRecording = vi.fn();
  });

  it('renders textarea with placeholder', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    expect(screen.getByPlaceholderText(/Опиши что хочешь создать/)).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        placeholder="Custom placeholder" 
      />
    );
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Hello');
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onSubmit when Enter is pressed', async () => {
    render(
      <InputArea 
        value="Some text" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, '{Enter}');
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('does not call onSubmit when Shift+Enter is pressed (new line)', async () => {
    render(
      <InputArea 
        value="Some text" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, '{Shift>}{Enter}{/Shift}');
    // Should not submit on Shift+Enter
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        disabled 
      />
    );
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('disables input when isGenerating is true', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        isGenerating 
      />
    );
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows stop button when generating', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        onStop={mockOnStop}
        isGenerating 
      />
    );
    
    // Should show stop button instead of send
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onStop when stop button is clicked', async () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        onStop={mockOnStop}
        isGenerating 
      />
    );
    
    const stopButton = screen.getAllByRole('button')[0];
    await userEvent.click(stopButton);
    expect(mockOnStop).toHaveBeenCalled();
  });

  it('shows voice input button when speech is supported', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        isSpeechSupported
        onToggleRecording={mockOnToggleRecording}
      />
    );
    
    // Should have at least 2 buttons (mic + send)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('does not show voice button when speech not supported', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        isSpeechSupported={false}
      />
    );
    
    // Should have only send button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('toggles recording when mic button clicked', async () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        isSpeechSupported
        onToggleRecording={mockOnToggleRecording}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    // First button should be mic
    await userEvent.click(buttons[0]);
    expect(mockOnToggleRecording).toHaveBeenCalled();
  });

  it('shows recording indicator when isRecording', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit}
        isSpeechSupported
        isRecording
        onToggleRecording={mockOnToggleRecording}
      />
    );
    
    // Should show "Говорите..." text
    expect(screen.getByText(/Говорите/)).toBeInTheDocument();
  });

  it('shows keyboard hint', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    expect(screen.getByText(/Shift/)).toBeInTheDocument();
    expect(screen.getByText(/Enter/)).toBeInTheDocument();
  });

  it('disables send button when value is empty', () => {
    render(
      <InputArea 
        value="" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const sendButton = screen.getAllByRole('button').pop();
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when value is not empty', () => {
    render(
      <InputArea 
        value="Hello" 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const sendButton = screen.getAllByRole('button').pop();
    expect(sendButton).not.toBeDisabled();
  });

  it('does not submit when value is only whitespace', async () => {
    render(
      <InputArea 
        value="   " 
        onChange={mockOnChange} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
