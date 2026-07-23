import { renderHook, act } from '@testing-library/react'
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest'
import { use2048 } from './useGame'

const LS_BEST = '2048_terminal_best'

describe('use2048 localStorage fallback', () => {
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    vi.restoreAllMocks();
  });

  test('handles localStorage.getItem throwing an error (getBest fallback to 0)', () => {
    // Mock localStorage to throw an error
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => { throw new Error('localStorage disabled'); }),
        setItem: vi.fn(),
      },
      writable: true
    });

    const { result } = renderHook(() => use2048());

    // The initial best score should be 0 because localStorage threw an error
    expect(result.current.best).toBe(0);
    expect(window.localStorage.getItem).toHaveBeenCalledWith(LS_BEST);
  });

  test('handles localStorage.setItem throwing an error (saveBest ignores error)', () => {
    // Mock localStorage to throw an error on setItem
    const mockSetItem = vi.fn(() => { throw new Error('localStorage quota exceeded'); });
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => '0'), // Start with 0 so it's easy to beat
        setItem: mockSetItem,
      },
      writable: true
    });

    const { result } = renderHook(() => use2048());

    // The initial best score should be 0
    expect(result.current.best).toBe(0);

    // Make random moves to trigger a merge and score increase
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.move('left');
        result.current.move('right');
        result.current.move('up');
        result.current.move('down');
      }
    });

    // Ensure score increased, triggering saveBest
    expect(result.current.best).toBeGreaterThan(0);

    // Ensure setItem was called, meaning our mock threw an error but it was caught
    expect(mockSetItem).toHaveBeenCalled();
  });
});
