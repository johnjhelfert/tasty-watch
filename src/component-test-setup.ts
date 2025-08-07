import { expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './test-utils/handlers';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/svelte';

// Extend expect with jest-dom matchers
expect.extend(matchers);

const server = setupServer(...handlers);

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
	server.resetHandlers();
	cleanup(); // Clean up rendered components
});

afterAll(() => {
	server.close();
});