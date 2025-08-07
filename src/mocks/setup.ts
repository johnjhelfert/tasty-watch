/**
 * Setup MSW for browser environments (E2E tests only)
 * This file is imported conditionally when needed
 */

async function initMocks() {
  if (typeof window === 'undefined') {
    return;
  }

  if (import.meta.env.MODE === 'test' || window.location.search.includes('msw=true')) {
    const { worker } = await import('../../tests/e2e/mocks/browser');
    
    return worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }
}

export { initMocks };