import '@testing-library/jest-dom';

// Mock axios
vi.mock('@/config/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock fetch (used by authService)
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Mock window.location
vi.stubGlobal('location', {
  href: 'http://localhost:3000/',
  pathname: '/',
  origin: 'http://localhost:3000',
});

// Suppress console.error noise in tests
vi.spyOn(console, 'error').mockImplementation((...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning:') || message.includes('ReactDOM'))
  ) {
    return;
  }
  console.warn(...args);
});