import {
	CreatePropertyDTO,
	ImageMetadata,
	PropertyState,
	PropertyType,
	PropertyTypes
} from '@/types/property.types'
import { Characteristic } from "@/types/Characteristic";
import {prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/lib/constants";
import { crearSlug } from "@/lib/generateSlug"
import {ImageService} from "@/services/image.service";
import {OperationEnum, PropertyTypeEnum} from "@prisma/client"
import {CloudinaryResult} from "@/types/cloudinary.types";
import {Prisma} from "@prisma/client/extension";
import {stateMap, typeMap} from "@/helpers/PropertyMapper";

/**
 * Filtros para búsqueda de propiedades
 */
interface PropertyFilters {
	types?: PropertyType[];
	operations?: PropertyState[];
	minPrice?: number;
	maxPrice?: number;
}

/**
 * Objeto WHERE para filtrar propiedades en Prisma
 */
interface WhereClause {
	type?: {
		in: PropertyTypeEnum[];
	};
	category?: {
		in: OperationEnum[];
	};
	price?: {
		gte?: number;
		lte?: number;
	};
}

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
		const validated = createPropertySchema.parse(dto);

		let uploadedImages: CloudinaryResult[] = [];

		try {

			uploadedImages = await this.imageService.uploadMultiple(
				files,
				0, // propertyId temporal - lo reemplazamos después
				imageMetadata
			);

			return await prisma.$transaction(async (tx) => {

				const property = await tx.property.create({
					data: {
						address: validated.address,
						city: validated.city,
						category: validated.state as OperationEnum, // TODO: Desharcodear
						price: validated.price,
						description: validated.description,
						ubication: validated.ubication,
						type: validated.type,
						// Genera slug - algo como: "venta-casa-tandil-123"
						slug: crearSlug(
							validated.description
						)
					}
				});

				await tx.image.createMany({
					data: uploadedImages.map((img, idx) => ({
						url: img.url,
						position: imageMetadata[idx].position,
						isMain: imageMetadata[idx].isMain,
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

	/**
	 * Buscar propiedades con filtros opcionales
	 */
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

	/**
	 * Construye objeto WHERE para Prisma
	 */
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