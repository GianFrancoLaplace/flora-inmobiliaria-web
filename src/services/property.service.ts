import {
	CreatePropertyDTO,
	ImageMetadata,
	PropertyTypes
} from '@/types/property.types'
import {
	PropertyFilters,
	WhereClause
} from '@/types/property.filter.types'

import { Characteristic } from "@/types/Characteristic";
import {prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/lib/constants";
import { crearSlug } from "@/lib/generateSlug"
import {ImageService} from "@/services/image.service";
import {OperationEnum, PropertyTypeEnum} from "@prisma/client"
import {CloudinaryResult} from "@/types/cloudinary.types";
import {stateMap, typeMap} from "@/helpers/PropertyMapper";
import {imageMetadataArraySchema} from "@/validations/property.schema";

export class PropertyService {

	imageService: ImageService;

	constructor() {
		this.imageService = new ImageService();
	}

	async create(
		dto: CreatePropertyDTO,
		files: File[],
		imageMetadata: ImageMetadata[]) {

		// Parse & validate en una línea - throws ZodError si falla
		const validatedProperty = createPropertySchema.parse(dto);
		const validatedImageMetadata = imageMetadataArraySchema.parse(imageMetadata);

		let uploadedImages: CloudinaryResult[] = [];

		try {

			uploadedImages = await this.imageService.uploadMultiple(
				files,
				0, // propertyId temporal - lo reemplazamos después
				validatedImageMetadata
			);

			return await prisma.$transaction(async (tx) => {

				const property = await tx.property.create({
					data: {
						address: validatedProperty.address,
						city: validatedProperty.city,
						category: validatedProperty.state,
						price: validatedProperty.price,
						description: validatedProperty.description,
						ubication: validatedProperty.ubication,
						type: validatedProperty.type,
						// Genera slug - algo como: "venta-casa-tandil-123"
						slug: crearSlug(
							validatedProperty.state +
							validatedProperty.description
						)
					}
				});

				await tx.image.createMany({
					data: uploadedImages.map((img, idx) => ({
						url: img.url,
						position: validatedImageMetadata[idx].position,
						isMain: validatedImageMetadata[idx].isMain,
						idProperty: property.idProperty
					}))
				});

				return await tx.property.findUnique({
					where: { idProperty: property.idProperty },
					include: { images: true }
				});
			})
		} catch (error) {
			if (uploadedImages.length > 0) {
				console.error('Transaction failed, rolling back Cloudinary uploads...');
				const publicIds = uploadedImages.map(img => img.publicId);
				await this.imageService.deleteMultiple(publicIds);
			}

			throw error;
		}
	}

	async findMany(filters?: PropertyFilters): Promise<PropertyTypes[]> {
		const where = this.buildWhereClause(filters);

		const properties = await prisma.property.findMany({
			where: Object.keys(where).length > 0 ? where : undefined,
			include: {
				characteristics: true,
				images: true,
			},
		});

		return this.mapToPropertyTypes(properties);
	}

	private buildWhereClause(filters?: PropertyFilters): WhereClause {
		const where: WhereClause = {};

		if (!filters) return where;

		if (filters.types && filters.types.length > 0) {
			where.type = {
				in: filters.types as PropertyTypeEnum[]
			};
		}

		if (filters.operations && filters.operations.length > 0) {
			where.category = {
				in: filters.operations as OperationEnum[]
			};
		}

		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			where.price = {};

			if (filters.minPrice !== undefined) {
				where.price.gte = filters.minPrice;
			}

			if (filters.maxPrice !== undefined) {
				where.price.lte = filters.maxPrice;
			}
		}

		return where;
	}

	/**
	 * Convierte propiedades de Prisma al formato de la aplicación
	 */
	private mapToPropertyTypes(properties: any[]): PropertyTypes[] {
		return properties.map((p): PropertyTypes => {

			const mappedCharacteristics: Characteristic[] = p.characteristics.map((c: any): Characteristic => {
				return {
					id: c.idCharacteristic,
					characteristic: c.characteristic,
					data_type: c.dataType === 'integer' ? 'integer' : 'text',
					value_integer: c.valueInteger ?? undefined,
					value_text: c.valueText?.trim() || undefined,
					category: c.category ?? undefined,
				};
			});

			const mappedImages: { id: number; url: string }[] = p.images.length > 0
				? [{ id: p.images[0].idImage, url: p.images[0].url }]
				: [];

			const result: PropertyTypes = {
				id: p.idProperty,
				address: p.address,
				city: p.city,
				slug: p.slug,
				state: stateMap[p.category as OperationEnum],
				price: p.price,
				description: p.description,
				type: typeMap[p.type as PropertyTypeEnum],
				ubication: p.ubication,
				characteristics: mappedCharacteristics,
				images: mappedImages,
			};

			return result;
		});
	}
}