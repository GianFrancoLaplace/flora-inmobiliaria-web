import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePropertySubmit } from './usePropertySubmit';
import { FormMode, PropertyFormInput } from '@/types/property-form.types';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

// Global fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock File objects for testing image uploads
const createMockFile = (name: string, type = 'image/jpeg'): File => {
	const blob = new Blob(['fake-image-content'], { type });
	return new File([blob], name, { type });
};

describe('usePropertySubmit', () => {

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Initial State Tests
	describe('Initial State', () => {
		it('should initialize with isLoading=false and error=null', () => {
			const { result } = renderHook(() => usePropertySubmit());

			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBe(null);
		});
	});

	// CREATE Mode Tests
	describe('Submit in CREATE Mode - Happy Path', () => {
		const mockPropertyData: PropertyFormInput = {
			address: 'Av. Corrientes 1234',
			city: 'Buenos Aires',
			price: 150000,
			surface: 120,
			description: 'Hermoso departamento en el centro',
			ubication: 'https://maps.google.com/?q=Corrientes+1234',
			type: PropertyTypeEnum.departamento,
			category: OperationEnum.venta,
			constructedArea: 100,
			bedrooms: 3,
			bathrooms: 2,
			garage: 1,
			floors: 2,
			images: [
				{
					type: 'new',
					file: createMockFile('living-room.jpg'),
					preview: 'blob:xyz123',
					position: 0,
					isMain: true
				},
				{
					type: 'new',
					file: createMockFile('kitchen.jpg'),
					preview: 'blob:xyz456',
					position: 1,
					isMain: false
				}
			],
			deletedImageIds: []
		};

		it('should call POST /api/properties with correct FormData', async () => {
			const mockResponse = { id: 123, success: true };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const { result } = renderHook(() => usePropertySubmit());

			const submitResult = await result.current.submit(
				mockPropertyData,
				FormMode.CREATE
			);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				'/api/properties',
				expect.objectContaining({
					method: 'POST',
					body: expect.any(FormData)
				})
			);

			expect(submitResult).toEqual(mockResponse);
			expect(result.current.error).toBe(null);
		});

		it('should include all required fields in FormData', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockPropertyData, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('address')).toBe('Av. Corrientes 1234');
			expect(formData.get('city')).toBe('Buenos Aires');
			expect(formData.get('price')).toBe('150000');
			expect(formData.get('surface')).toBe('120');
			expect(formData.get('description')).toBe('Hermoso departamento en el centro');
			expect(formData.get('ubication')).toBe('https://maps.google.com/?q=Corrientes+1234');
			expect(formData.get('type')).toBe('departamento');
			expect(formData.get('category')).toBe('venta');
		});

		it('should include optional fields when present', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockPropertyData, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('constructedArea')).toBe('100');
			expect(formData.get('bedrooms')).toBe('3');
			expect(formData.get('bathrooms')).toBe('2');
			expect(formData.get('garage')).toBe('1');
			expect(formData.get('floors')).toBe('2');
		});

		it('should omit optional fields when undefined', async () => {
			const dataWithoutOptionals: PropertyFormInput = {
				address: 'Ruta 2 Km 45',
				city: 'Cañuelas',
				price: 500000,
				surface: 10000,
				description: 'Campo con arboleda',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.campo,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 2 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(dataWithoutOptionals, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('constructedArea')).toBeNull();
			expect(formData.get('bedrooms')).toBeNull();
			expect(formData.get('bathrooms')).toBeNull();
			expect(formData.get('garage')).toBeNull();
			expect(formData.get('floors')).toBeNull();
		});

		it('should add new images with correct metadata', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 3 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockPropertyData, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const images = formData.getAll('images');
			expect(images).toHaveLength(2);
			expect((images[0] as File).name).toBe('living-room.jpg');
			expect((images[1] as File).name).toBe('kitchen.jpg');

			const metadata = JSON.parse(formData.get('imageMetadata') as string);
			expect(metadata).toEqual([
				{ position: 0, isMain: true },
				{ position: 1, isMain: false }
			]);
		});

		it('should manage loading states correctly', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 4 })
			});

			const { result } = renderHook(() => usePropertySubmit());

			expect(result.current.isLoading).toBe(false);

			const submitPromise = result.current.submit(mockPropertyData, FormMode.CREATE);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(true);
			});

			await submitPromise;

			expect(result.current.isLoading).toBe(false);
		});

		it('should handle all PropertyTypeEnum values correctly', async () => {
			const propertyTypes: PropertyTypeEnum[] = [
				PropertyTypeEnum.casa,
				PropertyTypeEnum.departamento,
				PropertyTypeEnum.campo,
				PropertyTypeEnum.local_comercial,
				PropertyTypeEnum.lote
			];

			for (const propertyType of propertyTypes) {
				mockFetch.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ id: 5 })
				});

				const data: PropertyFormInput = {
					...mockPropertyData,
					type: propertyType
				};

				const { result } = renderHook(() => usePropertySubmit());
				await result.current.submit(data, FormMode.CREATE);

				const formData = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1].body as FormData;
				expect(formData.get('type')).toBe(propertyType);
			}
		});

		it('should handle both OperationEnum values (alquiler and venta)', async () => {
			const operations: OperationEnum[] = [
				OperationEnum.alquiler,
				OperationEnum.venta
			];

			for (const operation of operations) {
				mockFetch.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ id: 6 })
				});

				const data: PropertyFormInput = {
					...mockPropertyData,
					category: operation
				};

				const { result } = renderHook(() => usePropertySubmit());
				await result.current.submit(data, FormMode.CREATE);

				const formData = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1].body as FormData;
				expect(formData.get('category')).toBe(operation);
			}
		});
	});

	// EDIT Mode Tests
	describe('Submit in EDIT Mode - Happy Path', () => {
		const mockEditData: PropertyFormInput = {
			address: 'Av. Santa Fe 2500',
			city: 'Buenos Aires',
			price: 200000,
			surface: 150,
			description: 'Casa moderna con piscina',
			ubication: 'https://maps.google.com',
			type: PropertyTypeEnum.casa,
			category: OperationEnum.alquiler,
			bedrooms: 4,
			bathrooms: 3,
			garage: 2,
			images: [
				{
					type: 'existing',
					id: 100,
					url: 'https://cloudinary.com/img-001.jpg',
					position: 0,
					isMain: true
				},
				{
					type: 'existing',
					id: 101,
					url: 'https://cloudinary.com/img-002.jpg',
					position: 1,
					isMain: false
				},
				{
					type: 'new',
					file: createMockFile('new-photo.jpg'),
					preview: 'blob:new123',
					position: 2,
					isMain: false
				}
			],
			deletedImageIds: [99, 98]
		};

		it('should call PUT /api/properties/[id] with propertyId', async () => {
			const mockResponse = { id: 456, updated: true };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const { result } = renderHook(() => usePropertySubmit());

			const submitResult = await result.current.submit(
				mockEditData,
				FormMode.EDIT,
				'456'
			);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				'/api/properties/456',
				expect.objectContaining({
					method: 'PUT',
					body: expect.any(FormData)
				})
			);

			expect(submitResult).toEqual(mockResponse);
		});

		it('should include existing images configuration with numeric IDs', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 7 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockEditData, FormMode.EDIT, '456');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const existingImages = JSON.parse(formData.get('existingImages') as string);
			expect(existingImages).toEqual([
				{ id: 100, position: 0, isMain: true },
				{ id: 101, position: 1, isMain: false }
			]);

			expect(typeof existingImages[0].id).toBe('number');
			expect(typeof existingImages[1].id).toBe('number');
		});

		it('should include deleted image IDs as numbers', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 8 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockEditData, FormMode.EDIT, '456');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const deletedIds = JSON.parse(formData.get('deletedImageIds') as string);
			expect(deletedIds).toEqual([99, 98]);

			expect(typeof deletedIds[0]).toBe('number');
			expect(typeof deletedIds[1]).toBe('number');
		});

		it('should add new images with metadata in EDIT mode', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 9 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(mockEditData, FormMode.EDIT, '456');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const newImages = formData.getAll('images');
			expect(newImages).toHaveLength(1);
			expect((newImages[0] as File).name).toBe('new-photo.jpg');

			const metadata = JSON.parse(formData.get('imageMetadata') as string);
			expect(metadata).toEqual([
				{ position: 2, isMain: false }
			]);
		});

		it('should allow changing type and category in EDIT mode', async () => {
			const editedData: PropertyFormInput = {
				...mockEditData,
				type: PropertyTypeEnum.local_comercial,
				category: OperationEnum.venta
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 10 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(editedData, FormMode.EDIT, '789');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('type')).toBe('local_comercial');
			expect(formData.get('category')).toBe('venta');
		});
	});

	// Error Handling Tests
	describe('Error Handling', () => {
		const basicData: PropertyFormInput = {
			address: 'Test Address',
			city: 'Test City',
			price: 100000,
			surface: 80,
			description: 'Test description',
			ubication: 'https://maps.google.com',
			type: PropertyTypeEnum.casa,
			category: OperationEnum.venta,
			images: [],
			deletedImageIds: []
		};

		it('should capture and set error when fetch fails (network error)', async () => {
			const networkError = new Error('Network failed');
			mockFetch.mockRejectedValueOnce(networkError);

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toThrow('Network failed');

			// Wait for React to update the hook's state after promise rejection
			await waitFor(() => {
				expect(result.current.error).toBe('Network failed');
			});

			expect(result.current.isLoading).toBe(false);
		});

		it('should throw error when response.ok is false (400)', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400
			});

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toThrow('Error al crear propiedad');

			await waitFor(() => {
				expect(result.current.error).toBe('Error al crear propiedad');
			});
		});

		it('should throw error when response.ok is false (500)', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toThrow('Error al crear propiedad');

			await waitFor(() => {
				expect(result.current.error).toBe('Error al crear propiedad');
			});
		});

		it('should throw error in EDIT when response.ok is false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404
			});

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.EDIT, '999')
			).rejects.toThrow('Error al actualizar propiedad');

			await waitFor(() => {
				expect(result.current.error).toBe('Error al actualizar propiedad');
			});
		});

		it('should handle non-Error throws with generic message', async () => {
			mockFetch.mockRejectedValueOnce('String error inesperado');

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toBe('String error inesperado');

			await waitFor(() => {
				expect(result.current.error).toBe('Ocurrió un error inesperado');
			});
		});

		it('should reset error to null on successful submit after previous error', async () => {
			const { result } = renderHook(() => usePropertySubmit());

			// First submit fails
			mockFetch.mockRejectedValueOnce(new Error('Primer error'));
			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toThrow();

			await waitFor(() => {
				expect(result.current.error).toBe('Primer error');
			});

			// Second submit succeeds
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 11 })
			});
			await result.current.submit(basicData, FormMode.CREATE);

			// Error should be cleared
			expect(result.current.error).toBe(null);
		});

		it('should ensure isLoading=false even if error occurs (finally block)', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Test error'));

			const { result } = renderHook(() => usePropertySubmit());

			await expect(
				result.current.submit(basicData, FormMode.CREATE)
			).rejects.toThrow();

			// Finally block must execute
			expect(result.current.isLoading).toBe(false);
		});
	});

	// Edge Cases Tests
	describe('Edge Cases', () => {
		it('should handle empty images array in CREATE', async () => {
			const dataWithoutImages: PropertyFormInput = {
				address: 'Lote sin construcción',
				city: 'La Plata',
				price: 80000,
				surface: 500,
				description: 'Lote sin mejoras',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.lote,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 12 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(dataWithoutImages, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const images = formData.getAll('images');
			expect(images).toHaveLength(0);

			const metadata = JSON.parse(formData.get('imageMetadata') as string);
			expect(metadata).toEqual([]);
		});

		it('should handle empty images array in EDIT', async () => {
			const dataWithoutImages: PropertyFormInput = {
				address: 'Local sin fotos',
				city: 'Rosario',
				price: 150000,
				surface: 100,
				description: 'Local comercial',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.local_comercial,
				category: OperationEnum.alquiler,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 13 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(dataWithoutImages, FormMode.EDIT, '123');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const existingImages = JSON.parse(formData.get('existingImages') as string);
			expect(existingImages).toEqual([]);

			const images = formData.getAll('images');
			expect(images).toHaveLength(0);
		});

		it('should handle empty deletedImageIds', async () => {
			const data: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 14 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(data, FormMode.EDIT, '123');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const deletedIds = JSON.parse(formData.get('deletedImageIds') as string);
			expect(deletedIds).toEqual([]);
		});

		it('should convert numbers to strings correctly (price, surface)', async () => {
			const dataWithNumbers: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 999999.99,
				surface: 1234.56,
				constructedArea: 1000.25,
				bedrooms: 5,
				bathrooms: 3,
				garage: 2,
				floors: 3,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 15 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(dataWithNumbers, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('price')).toBe('999999.99');
			expect(formData.get('surface')).toBe('1234.56');
			expect(formData.get('constructedArea')).toBe('1000.25');
			expect(formData.get('bedrooms')).toBe('5');
			expect(formData.get('bathrooms')).toBe('3');
			expect(formData.get('garage')).toBe('2');
			expect(formData.get('floors')).toBe('3');
		});

		it('should handle multiple new images in CREATE', async () => {
			const dataWithManyImages: PropertyFormInput = {
				address: 'Casa con muchas fotos',
				city: 'Córdoba',
				price: 250000,
				surface: 200,
				description: 'Casa espaciosa',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				images: Array.from({ length: 10 }, (_, i) => ({
					type: 'new' as const,
					file: createMockFile(`image-${i}.jpg`),
					preview: `blob:${i}`,
					position: i,
					isMain: i === 0
				})),
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 16 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(dataWithManyImages, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const images = formData.getAll('images');
			expect(images).toHaveLength(10);

			const metadata = JSON.parse(formData.get('imageMetadata') as string);
			expect(metadata).toHaveLength(10);
			expect(metadata[0].isMain).toBe(true);
			expect(metadata[5].isMain).toBe(false);
		});

		it('should handle complex mix in EDIT (existing + deleted + new)', async () => {
			const complexEditData: PropertyFormInput = {
				address: 'Propiedad compleja',
				city: 'Mendoza',
				price: 180000,
				surface: 140,
				description: 'Edición compleja',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.alquiler,
				images: [
					{
						type: 'existing',
						id: 201,
						url: 'https://cdn.com/keep1.jpg',
						position: 0,
						isMain: true
					},
					{
						type: 'existing',
						id: 202,
						url: 'https://cdn.com/keep2.jpg',
						position: 1,
						isMain: false
					},
					{
						type: 'new',
						file: createMockFile('new1.jpg'),
						preview: 'blob:new1',
						position: 2,
						isMain: false
					},
					{
						type: 'new',
						file: createMockFile('new2.jpg'),
						preview: 'blob:new2',
						position: 3,
						isMain: false
					}
				],
				deletedImageIds: [199, 198, 197]
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 17 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(complexEditData, FormMode.EDIT, 'prop-complex');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const existing = JSON.parse(formData.get('existingImages') as string);
			expect(existing).toHaveLength(2);
			expect(existing[0].id).toBe(201);
			expect(existing[1].id).toBe(202);

			const deleted = JSON.parse(formData.get('deletedImageIds') as string);
			expect(deleted).toEqual([199, 198, 197]);
			expect(typeof deleted[0]).toBe('number');

			const newImages = formData.getAll('images');
			expect(newImages).toHaveLength(2);

			const newMetadata = JSON.parse(formData.get('imageMetadata') as string);
			expect(newMetadata).toHaveLength(2);
		});

		it('should handle large deletedImageIds', async () => {
			const data: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: [999999, 888888, 777777]
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 18 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(data, FormMode.EDIT, '123');

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			const deletedIds = JSON.parse(formData.get('deletedImageIds') as string);
			expect(deletedIds).toEqual([999999, 888888, 777777]);
			deletedIds.forEach((id: number) => {
				expect(typeof id).toBe('number');
			});
		});
	});

	// Type Validation Tests
	describe('Type Validation', () => {
		it('should validate PropertyTypeEnum values at compile time', () => {
			const validTypes: PropertyTypeEnum[] = [
				PropertyTypeEnum.casa,
				PropertyTypeEnum.departamento,
				PropertyTypeEnum.campo,
				PropertyTypeEnum.local_comercial,
				PropertyTypeEnum.lote
			];

			expect(validTypes).toHaveLength(5);
		});

		it('should validate OperationEnum values at compile time', () => {
			const validOperations: OperationEnum[] = [
				OperationEnum.alquiler,
				OperationEnum.venta
			];

			expect(validOperations).toHaveLength(2);
		});

		it('should accept correct type and category values', async () => {
			const validData: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.alquiler,
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 19 })
			});

			const { result } = renderHook(() => usePropertySubmit());
			await result.current.submit(validData, FormMode.CREATE);

			expect(mockFetch).toHaveBeenCalled();
		});

		it('should handle optional type and category (undefined)', async () => {
			const dataWithoutTypeCategory: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				images: [],
				deletedImageIds: []
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 20 })
			});

			const { result } = renderHook(() => usePropertySubmit());

			await result.current.submit(dataWithoutTypeCategory, FormMode.CREATE);

			const formData = mockFetch.mock.calls[0][1].body as FormData;

			expect(formData.get('type')).toBe('undefined');
			expect(formData.get('category')).toBe('undefined');
		});
	});

	// Concurrency Tests
	describe('Concurrency', () => {
		it('should handle multiple consecutive submits correctly', async () => {
			const data: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				images: [],
				deletedImageIds: []
			};

			mockFetch
				.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 21 }) })
				.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 22 }) })
				.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 23 }) });

			const { result } = renderHook(() => usePropertySubmit());

			const result1 = await result.current.submit(data, FormMode.CREATE);
			const result2 = await result.current.submit(data, FormMode.CREATE);
			const result3 = await result.current.submit(data, FormMode.CREATE);

			expect(result1.id).toBe(21);
			expect(result2.id).toBe(22);
			expect(result3.id).toBe(23);

			expect(mockFetch).toHaveBeenCalledTimes(3);
			expect(result.current.isLoading).toBe(false);
		});

		it('should reset error state between submits', async () => {
			const data: PropertyFormInput = {
				address: 'Test',
				city: 'Test',
				price: 100000,
				surface: 80,
				description: 'Test',
				ubication: 'https://maps.google.com',
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.alquiler,
				images: [],
				deletedImageIds: []
			};

			const { result } = renderHook(() => usePropertySubmit());

			// First submit fails
			mockFetch.mockRejectedValueOnce(new Error('Error 1'));
			await expect(result.current.submit(data, FormMode.CREATE)).rejects.toThrow();

			await waitFor(() => {
				expect(result.current.error).toBe('Error 1');
			});

			// Second submit fails with different error
			mockFetch.mockRejectedValueOnce(new Error('Error 2'));
			await expect(result.current.submit(data, FormMode.CREATE)).rejects.toThrow();

			await waitFor(() => {
				expect(result.current.error).toBe('Error 2');
			});

			// Third submit succeeds
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 24 }) });
			await result.current.submit(data, FormMode.CREATE);
			expect(result.current.error).toBe(null);
		});
	});
});