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

	const validPropertyData = {
		address: '123 Fake Street',
		city: 'Tandil',
		state: 'venta' as const,
		price: 150000,
		description: 'Casa hermosa',
		ubication: '-37.3217, -59.1332',
		type: 'casa' as const,
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
		propertyData: typeof validPropertyData,
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
	// HAPPY PATH
	// ============================================

	it('should create property with images successfully', async () => {
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
			address: validPropertyData.address,
			city: validPropertyData.city,
			category: 'venta' as const,
			price: validPropertyData.price,
			description: validPropertyData.description,
			ubication: validPropertyData.ubication,
			type: 'casa' as const,
			seo_description: null,
			neighborhood: null,
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

		// Mock de ImageService
		vi.spyOn(ImageService.prototype, 'uploadMultiple')
			.mockResolvedValue(mockCloudinaryResults);

		vi.mocked(prisma.$transaction).mockImplementation(
			async (callback) => {
				const mockTx = {
					property: {
						create: vi.fn().mockResolvedValue({
							idProperty: 1,
							address: validPropertyData.address,
							city: validPropertyData.city,
							category: 'venta',
							price: validPropertyData.price,
							description: validPropertyData.description,
							ubication: validPropertyData.ubication,
							type: 'casa',
							seo_description: null,
							neighborhood: null,
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

		const formData = createFormData(validPropertyData, mockImages, validImageMetadata);
		const request = createMockRequest(formData);

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data).toHaveProperty('idProperty', 1);
		expect(data.images).toHaveLength(2);
		expect(data.images[0].isMain).toBe(true);
	});

	// ============================================
	// VALIDATION ERRORS
	// ============================================

	it('should reject mismatched images and metadata count', async () => {
		const images = [
			createMockFile('img1.jpg'),
			createMockFile('img2.jpg'),
		];

		const metadata = [{ position: 0, isMain: true }];

		const formData = createFormData(validPropertyData, images, metadata);
		const request = createMockRequest(formData);

		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain('no coincide');
	});

	it('should reject invalid property data', async () => {
		const invalidData = {
			...validPropertyData,
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

	// ============================================
	// ERROR HANDLING & ROLLBACK
	// ============================================

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
			new Error('Database error')
		);

		const formData = createFormData(
			validPropertyData,
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
			validPropertyData,
			mockImages,
			[{ position: 0, isMain: true }]
		);
		const request = createMockRequest(formData);

		const response = await POST(request);

		expect(response.status).toBe(500);
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});
});