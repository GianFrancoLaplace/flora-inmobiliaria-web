// vitest.setup.ts
import { vi } from "vitest";
import "@testing-library/jest-dom"; // Ahora SÍ va a funcionar

// Mock global fetch
global.fetch = vi.fn();

// Mock window.matchMedia (común en Next.js)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});