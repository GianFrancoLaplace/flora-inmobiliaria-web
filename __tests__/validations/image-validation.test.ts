import { describe, it, expect, vi } from 'vitest';
import { validateImageFile } from '@/validations/image.validation';

describe('validateImageFile', () => {
	const createFile = (size: number, type: string): File => {
		return new File(['x'.repeat(size)], 'test.jpg', { type });
	};

	it('acepta JPEG válido', () => {
		const file = createFile(1024 * 1024, 'image/jpeg');
		const result = validateImageFile(file);

		expect(result.valid).toBe(true);
	});

	it('rechaza archivo grande', () => {
		const file = createFile(6 * 1024 * 1024, 'image/jpeg');
		const result = validateImageFile(file);

		expect(result.valid).toBe(false);
		expect(result.error).toContain('muy grande');
	});
})