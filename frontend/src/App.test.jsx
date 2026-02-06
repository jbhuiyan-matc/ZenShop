/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AppProvider } from './store/AppContext';
import App from './App';

// Mock the API modules to prevent network calls during tests
vi.mock('./services/api', () => ({
  authAPI: {
    getProfile: vi.fn().mockResolvedValue({ id: '1', name: 'Test User', role: 'USER' }),
  },
  cartAPI: {
    getCart: vi.fn().mockResolvedValue([]),
  },
}));

// Mock the lazy loaded components to avoid suspense issues in simple tests
// or let Suspense do its thing. We'll test the loading state.

describe('App', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    );
    
    // The App component renders Suspense with "Loading ZenShop..."
    const loadingElement = screen.getByText(/Loading ZenShop/i);
    expect(loadingElement).toBeDefined();
  });
});
