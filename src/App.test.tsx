import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { PlanProvider } from './state/PlanContext';

describe('App', () => {
  it('renders the companion title', () => {
    render(
      <PlanProvider>
        <App />
      </PlanProvider>
    );

    expect(screen.getByText(/HE•R Companion/i)).toBeInTheDocument();
  });
});
