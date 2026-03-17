import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Next.js modules that may be imported in tested code
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));
