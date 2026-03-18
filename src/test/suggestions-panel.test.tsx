/**
 * 🧪 SuggestionsPanel Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { SuggestionsPanel, AISuggestion } from '@/components/chat/SuggestionsPanel';
import type React from 'react';

type MotionProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionProps) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: MotionProps) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const mockSuggestions: AISuggestion[] = [
  { id: '1', text: 'Add dark mode', type: 'improve', priority: 'high' },
  { id: '2', text: 'Fix button styling', type: 'fix', priority: 'medium' },
  { id: '3', text: 'Add animations', type: 'effect', priority: 'low' },
  { id: '4', text: 'Add footer section', type: 'add', priority: 'medium' },
];

describe('SuggestionsPanel', () => {
  it('renders nothing when suggestions array is empty', () => {
    const { container } = render(
      <SuggestionsPanel 
        suggestions={[]} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}} 
        hasCompletedBuild={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders suggestion chips', () => {
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={false} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}} 
        hasCompletedBuild={true}
      />
    );
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Fix button styling')).toBeInTheDocument();
  });

  it('shows suggestions regardless of isOpen prop', () => {
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}} 
        hasCompletedBuild={true}
      />
    );
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Fix button styling')).toBeInTheDocument();
  });

  it('respects maxVisible prop', () => {
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}}
        maxVisible={2}
        hasCompletedBuild={true}
      />
    );
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Fix button styling')).toBeInTheDocument();
    expect(screen.queryByText('Add animations')).not.toBeInTheDocument();
  });

  it('calls onSuggestionClick when suggestion is clicked', async () => {
    const onSuggestionClick = vi.fn();
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={onSuggestionClick} 
        hasCompletedBuild={true}
      />
    );
    
    await userEvent.click(screen.getByText('Add dark mode'));
    expect(onSuggestionClick).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('applies different styling based on priority', () => {
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}} 
        hasCompletedBuild={true}
      />
    );
    
    // High priority should have subtle emphasized border
    const highPriorityButton = screen.getByText('Add dark mode').closest('button');
    expect(highPriorityButton).toHaveClass('border-foreground/15');
  });

  it('shows all suggestions when maxVisible equals suggestions length', () => {
    render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}}
        maxVisible={4}
        hasCompletedBuild={true}
      />
    );
    
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    expect(screen.getByText('Fix button styling')).toBeInTheDocument();
    expect(screen.getByText('Add animations')).toBeInTheDocument();
    expect(screen.queryByText(/ещё/)).not.toBeInTheDocument();
  });

  it('handles single suggestion', () => {
    render(
      <SuggestionsPanel 
        suggestions={[mockSuggestions[0]]} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}} 
        hasCompletedBuild={true}
      />
    );
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SuggestionsPanel 
        suggestions={mockSuggestions} 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuggestionClick={() => {}}
        className="custom-class"
        hasCompletedBuild={true}
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
