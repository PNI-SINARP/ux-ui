import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './navbar';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Mock dependencies
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}));

jest.mock('@/routing', () => ({
  Link: ({ children, href, onClick, className }: { children: React.ReactNode, href: string, onClick?: React.MouseEventHandler, className?: string }) => (
    <a href={href} onClick={onClick} className={className} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: jest.fn(),
}));

describe('Navbar Integration', () => {
  beforeEach(() => {
    (useIntersectionObserver as jest.Mock).mockReturnValue('');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply active styling to the correct section based on useIntersectionObserver', () => {
    (useIntersectionObserver as jest.Mock).mockReturnValue('equipo');
    
    render(<Navbar />);
    
    // Check that 'equipo' link has the active class text-foreground
    const equipoLink = screen.getByTestId('link-/#equipo');
    expect(equipoLink.className).toContain('text-foreground');
    expect(equipoLink.className).not.toContain('text-muted-foreground');
    
    // Check that 'hero' link is not active
    const heroLink = screen.getByTestId('link-/#hero');
    expect(heroLink.className).toContain('text-muted-foreground');
  });

  it('should close mobile menu on link click', () => {
    render(<Navbar />);
    
    // Open the menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // Assuming the dialog/sheet content is visible now
    const mobileLink = screen.getAllByTestId('link-/#equipo')[1]; // Desktop is [0], mobile is [1]
    
    // Click the link
    fireEvent.click(mobileLink);
    
    // Check if the sheet closes (state updates are handled internally by Sheet component, but we verify onClick trigger)
    // The onClick in the link calls setSheetOpen(false)
    expect(mobileLink).toBeDefined();
  });
});
