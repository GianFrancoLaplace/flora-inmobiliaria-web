import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/properties/route';
import { NextRequest } from 'next/server';
import { ImageService } from '@/services/image.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
	prisma: {
		property: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
		image: {
			createMany: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock('@/lib/cloudinary', () => ({
	default: {
		uploader: {
			upload_stream: vi.fn(),
			destroy: vi.fn(),
		},
	},
}));

describe('POST /api/properties', () => {

	// ============================================
	// TEST DATA FACTORIES POR TIPO DE PROPIEDAD
	// ============================================

	/**
	 * CASA: Requiere bedrooms, bathrooms
	 * Opcional: constructedArea, floors, garage
	 */
	const validCasaData = {
		address: '123 Fake Street',
		city: 'Tandil',
		state: 'venta' as const,
		price: 150000,
		description: 'Casa hermosa con jardín y cochera doble para toda la familia',
		ubication: '-37.3217, -59.1332',
		type: 'casa' as const,
		surface: 250,
		bedrooms: 3,
		bathrooms: 2,
		constructed_area: 180, // <= surface (validación de negocio)
		floors: 1,
		garage: 2
	};

	/**
	 * DEPARTAMENTO: Requiere bedrooms, bathrooms
	 * Opcional: garage
	 * NO usa: constructedArea, floors
	 */
	const validDepartamentoData = {
		address: 'Av. Libertador 456',
		city: 'Tandil',
		state: 'alquiler' as const,
		price: 80000,
		description: 'Departamento luminoso en edificio moderno con amenities completos',
		ubication: '-37.3217, -59.1332',
		type: 'departamento' as const,
		surface: 65,
		bedrooms: 2,
		bathrooms: 1,
		garage: 1
	};

	/**
	 * TERRENO: Solo campos base
	 * NO requiere: bedrooms, bathrooms, constructedArea, floors, garage
	 */
	const validTerrenoData = {
		address: 'Ruta 226 Km 15',
		city: 'Tandil',
		state: 'venta' as const,
		price: 50000,
		description: 'Terreno apto para construcción con escritura al día y servicios',
		ubication: '-37.3217, -59.1332',
		type: 'lote' as const,
		surface: 500
	};

	const validImageMetadata = [
		{ position: 0, isMain: true },
		{ position: 1, isMain: false },
	];

	const createMockFile = (name: string): File => {
		const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
		return new File([blob], name, { type: 'image/jpeg' });
	};

	const createFormData = (
		propertyData: Record<string, any>,
		images: File[],
		metadata: typeof validImageMetadata
	): FormData => {
		const formData = new FormData();

		Object.entries(propertyData).forEach(([key, value]) => {
			formData.append(key, String(value));
		});

		images.forEach(img => formData.append('images', img));
		formData.append('imageMetadata', JSON.stringify(metadata));

		return formData;
	};

	const createMockRequest = (formData: FormData): NextRequest => {
		return {
			formData: async () => formData,
		} as unknown as NextRequest;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ============================================
	// HAPPY PATH - POR TIPO DE PROPIEDAD
	// ============================================

	describe('Happy Path - Property Creation', () => {
		it('should create CASA with all required fields', async () => {
			const mockImages = [
				createMockFile('image1.jpg'),
				createMockFile('image2.jpg'),
			];

			const mockCloudinaryResults = [
				{
					url: 'https://cloudinary.com/image1.jpg',
					publicId: 'property_0_0_123456',
					width: 1920,
					height: 1080,
					format: 'jpg',
					bytes: 512000,
					createdAt: new Date().toISOString(),
				},
				{
					url: 'https://cloudinary.com/image2.jpg',
					publicId: 'property_0_1_123457',
					width: 1920,
					height: 1080,
					format: 'jpg',
					bytes: 512000,
					createdAt: new Date().toISOString(),
				},
			];

			const mockCreatedProperty = {
				idProperty: 1,
				address: validCasaData.address,
				city: validCasaData.city,
				category: 'venta' as const,
				price: validCasaData.price,
				description: validCasaData.description,
				ubication: validCasaData.ubication,
				type: 'casa' as const,
				surface: validCasaData.surface,
				bedrooms: validCasaData.bedrooms,
				bathrooms: validCasaData.bathrooms,
				constructedArea: validCasaData.constructed_area,
				floors: validCasaData.floors,
				garage: validCasaData.garage,
				seo_description: null,
				neighborhood: null,
				slug: 'venta-casa-hermosa-con-jardin',
				images: [
					{
						idImage: 1,
						url: mockCloudinaryResults[0].url,
						publicId: mockCloudinaryResults[0].publicId,
						position: 0,
						isMain: true,
						propertyId: 1,
						altText: null,
					},
					{
						idImage: 2,
						url: mockCloudinaryResults[1].url,
						publicId: mockCloudinaryResults[1].publicId,
						position: 1,
						isMain: false,
						propertyId: 1,
						altText: null,
					},
				],
			};

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue(mockCloudinaryResults);

			vi.mocked(prisma.$transaction).mockImplementation(
				async (callback) => {
					const mockTx = {
						property: {
							create: vi.fn().mockResolvedValue({
								idProperty: 1,
								address: validCasaData.address,
								city: validCasaData.city,
								category: 'venta',
								price: validCasaData.price,
								description: validCasaData.description,
								ubication: validCasaData.ubication,
								type: 'casa',
								surface: validCasaData.surface,
								bedrooms: validCasaData.bedrooms,
								bathrooms: validCasaData.bathrooms,
								constructedArea: validCasaData.constructed_area,
								floors: validCasaData.floors,
								garage: validCasaData.garage,
								seo_description: null,
								neighborhood: null,
								slug: 'venta-casa-hermosa-con-jardin',
							}),
							findUnique: vi.fn().mockResolvedValue(mockCreatedProperty),
						},
						image: {
							createMany: vi.fn().mockResolvedValue({ count: 2 }),
						},
					};

					return await callback(mockTx as unknown as Parameters<typeof callback>[0]);
				}
			);

			const formData = createFormData(validCasaData, mockImages, validImageMetadata);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data).toHaveProperty('idProperty', 1);
			expect(data.images).toHaveLength(2);
			expect(data.images[0].isMain).toBe(true);
			expect(data.bedrooms).toBe(3);
			expect(data.bathrooms).toBe(2);
		});

		it('should create DEPARTAMENTO with required fields', async () => {
			const mockImages = [createMockFile('depto.jpg')];

			const mockCloudinaryResult = [{
				url: 'https://cloudinary.com/depto.jpg',
				publicId: 'property_0_0_dept',
				width: 1920,
				height: 1080,
				format: 'jpg',
				bytes: 512000,
				createdAt: new Date().toISOString(),
			}];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue(mockCloudinaryResult);

			vi.mocked(prisma.$transaction).mockImplementation(
				async (callback) => {
					const mockTx = {
						property: {
							create: vi.fn().mockResolvedValue({
								idProperty: 2,
								...validDepartamentoData,
								category: validDepartamentoData.state,
								slug: 'alquiler-departamento-luminoso',
							}),
							findUnique: vi.fn().mockResolvedValue({
								idProperty: 2,
								...validDepartamentoData,
								category: validDepartamentoData.state,
								slug: 'alquiler-departamento-luminoso',
								images: [{
									idImage: 1,
									url: mockCloudinaryResult[0].url,
									publicId: mockCloudinaryResult[0].publicId,
									position: 0,
									isMain: true,
									propertyId: 2,
									altText: null,
								}],
							}),
						},
						image: {
							createMany: vi.fn().mockResolvedValue({ count: 1 }),
						},
					};

					return await callback(mockTx as unknown as Parameters<typeof callback>[0]);
				}
			);

			const formData = createFormData(
				validDepartamentoData,
				mockImages,
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.type).toBe('departamento');
			expect(data.bedrooms).toBe(2);
			expect(data.bathrooms).toBe(1);
		});

		it('should create TERRENO with only base fields', async () => {
			const mockImages = [createMockFile('terreno.jpg')];

			const mockCloudinaryResult = [{
				url: 'https://cloudinary.com/terreno.jpg',
				publicId: 'property_0_0_terreno',
				width: 1920,
				height: 1080,
				format: 'jpg',
				bytes: 512000,
				createdAt: new Date().toISOString(),
			}];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue(mockCloudinaryResult);

			vi.mocked(prisma.$transaction).mockImplementation(
				async (callback) => {
					const mockTx = {
						property: {
							create: vi.fn().mockResolvedValue({
								idProperty: 3,
								...validTerrenoData,
								category: validTerrenoData.state,
								slug: 'venta-terreno-apto-construccion',
								bedrooms: null,
								bathrooms: null,
								constructedArea: null,
								floors: null,
								garage: null,
							}),
							findUnique: vi.fn().mockResolvedValue({
								idProperty: 3,
								...validTerrenoData,
								category: validTerrenoData.state,
								slug: 'venta-terreno-apto-construccion',
								images: [{
									idImage: 1,
									url: mockCloudinaryResult[0].url,
									publicId: mockCloudinaryResult[0].publicId,
									position: 0,
									isMain: true,
									propertyId: 3,
									altText: null,
								}],
							}),
						},
						image: {
							createMany: vi.fn().mockResolvedValue({ count: 1 }),
						},
					};

					return await callback(mockTx as unknown as Parameters<typeof callback>[0]);
				}
			);

			const formData = createFormData(
				validTerrenoData,
				mockImages,
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();
			console.log('TERRENO ERROR:', JSON.stringify(data, null, 2)); // <-- AGREGA ESTO

			expect(response.status).toBe(201);
			expect(data.type).toBe('lote');
			// Terrenos no necesitan bedrooms, bathrooms, etc.
		});
	});

	// ============================================
	// VALIDATION ERRORS - CAMPOS REQUERIDOS CONDICIONALES
	// ============================================

	describe('Validation Errors - Conditional Required Fields', () => {
		it('should reject CASA without bedrooms', async () => {
			const invalidCasa = {
				...validCasaData,
				bedrooms: undefined, // FALTA campo requerido
			};

			const formData = createFormData(
				invalidCasa,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('dormitorio');
		});

		it('should reject CASA without bathrooms', async () => {
			const invalidCasa = {
				...validCasaData,
				bathrooms: undefined, // FALTA campo requerido
			};

			const formData = createFormData(
				invalidCasa,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('baño');
		});

		it('should reject DEPARTAMENTO without bedrooms', async () => {
			const invalidDepto = {
				...validDepartamentoData,
				bedrooms: undefined,
			};

			const formData = createFormData(
				invalidDepto,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('dormitorio');
		});

		it('should reject DEPARTAMENTO without bathrooms', async () => {
			const invalidDepto = {
				...validDepartamentoData,
				bathrooms: undefined,
			};

			const formData = createFormData(
				invalidDepto,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('baño');
		});

		it('should reject CASA with constructedArea > surface', async () => {
			const invalidCasa = {
				...validCasaData,
				surface: 100,
				constructed_area: 150, // MAYOR que surface - validación de negocio
			};

			const formData = createFormData(
				invalidCasa,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('área construida');
		});
	});

	// ============================================
	// VALIDATION ERRORS - CAMPOS BASE
	// ============================================

	describe('Validation Errors - Base Fields', () => {
		it('should reject negative price', async () => {
			const invalidData = {
				...validCasaData,
				price: -1000,
			};

			const formData = createFormData(
				invalidData,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
		});

		it('should reject description too short', async () => {
			const invalidData = {
				...validCasaData,
				description: 'Casa', // Menos de 10 caracteres
			};

			const formData = createFormData(
				invalidData,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
			expect(JSON.stringify(data.errors)).toContain('descripción');
		});

		it('should reject invalid property type', async () => {
			const invalidData = {
				...validCasaData,
				type: 'mansion' as any, // Tipo inválido
			};

			const formData = createFormData(
				invalidData,
				[createMockFile('test.jpg')],
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
		});
	});

	// ============================================
	// IMAGE VALIDATION ERRORS
	// ============================================

	describe('Image Validation Errors', () => {
		it('should reject mismatched images and metadata count', async () => {
			const images = [
				createMockFile('img1.jpg'),
				createMockFile('img2.jpg'),
			];

			const metadata = [{ position: 0, isMain: true }]; // Solo 1 metadata para 2 imágenes

			const formData = createFormData(validCasaData, images, metadata);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toContain('no coincide');
		});

		it('should reject metadata without main image', async () => {
			const images = [
				createMockFile('img1.jpg'),
				createMockFile('img2.jpg'),
			];

			const metadata = [
				{ position: 0, isMain: false }, // Ninguna es principal
				{ position: 1, isMain: false },
			];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue([]);

			const formData = createFormData(validCasaData, images, metadata);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
		});

		it('should reject duplicate positions in metadata', async () => {
			const images = [
				createMockFile('img1.jpg'),
				createMockFile('img2.jpg'),
			];

			const metadata = [
				{ position: 0, isMain: true },
				{ position: 0, isMain: false }, // Posición duplicada
			];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue([]);

			const formData = createFormData(validCasaData, images, metadata);
			const request = createMockRequest(formData);

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toHaveProperty('errors');
		});
	});

	// ============================================
	// ERROR HANDLING & ROLLBACK
	// ============================================

	describe('Error Handling & Rollback', () => {
		it('should rollback Cloudinary uploads on database failure', async () => {
			const mockImages = [createMockFile('test.jpg')];
			const mockCloudinaryResult = [{
				url: 'https://cloudinary.com/test.jpg',
				publicId: 'test_public_id',
				width: 1920,
				height: 1080,
				format: 'jpg',
				bytes: 512000,
				createdAt: new Date().toISOString(),
			}];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue(mockCloudinaryResult);

			const deleteMultipleSpy = vi.spyOn(ImageService.prototype, 'deleteMultiple')
				.mockResolvedValue(undefined);

			// Transaction que falla
			vi.mocked(prisma.$transaction).mockRejectedValue(
				new Error('Database connection timeout')
			);

			const formData = createFormData(
				validCasaData,
				mockImages,
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);

			expect(response.status).toBe(500);
			expect(deleteMultipleSpy).toHaveBeenCalledWith(['test_public_id']);
		});

		it('should handle Cloudinary upload failure', async () => {
			const mockImages = [createMockFile('test.jpg')];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockRejectedValue(new Error('Cloudinary timeout'));

			const formData = createFormData(
				validCasaData,
				mockImages,
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);

			expect(response.status).toBe(500);
			expect(prisma.$transaction).not.toHaveBeenCalled();
		});

		it('should handle multiple Cloudinary uploads when one fails', async () => {
			const mockImages = [
				createMockFile('img1.jpg'),
				createMockFile('img2.jpg'),
			];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockRejectedValue(new Error('Upload failed for image 2'));

			const formData = createFormData(
				validCasaData,
				mockImages,
				validImageMetadata
			);
			const request = createMockRequest(formData);

			const response = await POST(request);

			expect(response.status).toBe(500);
			// No debería llegar a la transacción si Cloudinary falla
			expect(prisma.$transaction).not.toHaveBeenCalled();
		});
	});

	// ============================================
	// EDGE CASES
	// ============================================

	describe('Edge Cases', () => {
		it('should handle missing imageMetadata field', async () => {
			const formData = new FormData();

			Object.entries(validCasaData).forEach(([key, value]) => {
				formData.append(key, String(value));
			});

			formData.append('images', createMockFile('test.jpg'));
			// NO agregar imageMetadata

			const request = createMockRequest(formData);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toContain('imageMetadata');
		});

		it('should handle invalid JSON in imageMetadata', async () => {
			const formData = new FormData();

			Object.entries(validCasaData).forEach(([key, value]) => {
				formData.append(key, String(value));
			});

			formData.append('images', createMockFile('test.jpg'));
			formData.append('imageMetadata', 'invalid-json{]'); // JSON malformado

			const request = createMockRequest(formData);
			const response = await POST(request);

			expect(response.status).toBe(500); // JSON.parse throw error
		});

		it('should accept CASA with optional fields undefined', async () => {
			const casaSinOpcionales = {
				address: validCasaData.address,
				city: validCasaData.city,
				state: validCasaData.state,
				price: validCasaData.price,
				description: validCasaData.description,
				ubication: validCasaData.ubication,
				type: validCasaData.type,
				surface: validCasaData.surface,
				bedrooms: validCasaData.bedrooms,
				bathrooms: validCasaData.bathrooms,
				// NO enviar: constructed_area, floors, garage
			};

			const mockImages = [createMockFile('test.jpg')];
			const mockCloudinaryResult = [{
				url: 'https://cloudinary.com/test.jpg',
				publicId: 'test_public_id',
				width: 1920,
				height: 1080,
				format: 'jpg',
				bytes: 512000,
				createdAt: new Date().toISOString(),
			}];

			vi.spyOn(ImageService.prototype, 'uploadMultiple')
				.mockResolvedValue(mockCloudinaryResult);

			vi.mocked(prisma.$transaction).mockImplementation(
				async (callback) => {
					const mockTx = {
						property: {
							create: vi.fn().mockResolvedValue({
								idProperty: 1,
								...casaSinOpcionales,
								category: casaSinOpcionales.state,
								constructedArea: null,
								floors: null,
								garage: null,
							}),
							findUnique: vi.fn().mockResolvedValue({
								idProperty: 1,
								...casaSinOpcionales,
								category: casaSinOpcionales.state,
								images: [{
									idImage: 1,
									url: mockCloudinaryResult[0].url,
									publicId: mockCloudinaryResult[0].publicId,
									position: 0,
									isMain: true,
									propertyId: 1,
									altText: null,
								}],
							}),
						},
						image: {
							createMany: vi.fn().mockResolvedValue({ count: 1 }),
						},
					};

					return await callback(mockTx as unknown as Parameters<typeof callback>[0]);
				}
			);

			const formData = createFormData(
				casaSinOpcionales,
				mockImages,
				[{ position: 0, isMain: true }]
			);
			const request = createMockRequest(formData);

			const response = await POST(request);

			expect(response.status).toBe(201);
		});
	});
});