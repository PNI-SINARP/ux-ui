import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from './useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let mockIntersectionObserver: jest.Mock;
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let triggerIntersection: (entries: Partial<IntersectionObserverEntry>[]) => void;

  beforeEach(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();
    
    mockIntersectionObserver = jest.fn().mockImplementation((callback) => {
      triggerIntersection = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: jest.fn(),
      };
    });
    
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
    
    // Mock getElementById
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'non-existent') return null;
      const el = document.createElement('div');
      el.id = id;
      return el;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty string initially if no sections are intersecting', () => {
    const { result } = renderHook(() => useIntersectionObserver(['hero', 'equipo']));
    expect(result.current).toBe('');
  });

  it('should set active id when a section intersects', () => {
    const { result } = renderHook(() => useIntersectionObserver(['hero', 'equipo']));
    
    act(() => {
      triggerIntersection([
        {
          target: { id: 'equipo' } as Element,
          isIntersecting: true,
          intersectionRatio: 0.6,
        },
      ]);
    });
    
    expect(result.current).toBe('equipo');
  });

  it('should not update if intersection ratio is below threshold if we implement one, or just when intersecting', () => {
    const { result } = renderHook(() => useIntersectionObserver(['hero', 'equipo']));
    
    act(() => {
      triggerIntersection([
        {
          target: { id: 'hero' } as Element,
          isIntersecting: false,
        },
      ]);
    });
    
    expect(result.current).toBe('');
  });
});
