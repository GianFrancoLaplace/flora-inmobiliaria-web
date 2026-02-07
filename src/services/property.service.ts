import { PropertyData, PropertyUpdateData } from "@/types/property-api.types";
import {ImageMetadata, ExistingImage} from "@/types/image.types";
import {
	CreatePropertyDto,
} from '@/types/property-api.types'
import {
	PropertyFilters,
	WhereClause
} from '@/types/property.filter.types'

import {prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/validations/property.schema";
import { crearSlug } from "@/lib/generateSlug"
import {ImageService} from "@/services/image.service";
import {OperationEnum, PropertyTypeEnum} from "@prisma/client"
import {CloudinaryResult} from "@/types/cloudinary.types";
import {imageMetadataArraySchema} from "@/validations/property.schema";
import {NextResponse} from "next/server";
import { propertyUpdateSchema} from "@/validations/property";
import {PropertyWithImages} from "@/types/prisma";

const TEMP_SLUG = 'temp-slug';

type PutPayload = {
	property: PropertyUpdateData;
	existingImages: Pick<ExistingImage, "id" | "position" | "isMain">[];
	deletedImageIds: number[];
	imageFiles: File[];
	imageMetadata: ImageMetadata[];
};

export class PropertyService {

	imageService: ImageService;

	constructor() {
		this.imageService = new ImageService();
	}

	async create(
		dto: CreatePropertyDto,
		files: File[],
		imageMetadata: ImageMetadata[]) {

		// console.log("CREATE", dto);

		// Parse & validate en una línea - throws ZodError si falla
		const validatedProperty = createPropertySchema.parse(dto);
		const validatedImageMetadata = imageMetadataArraySchema.parse(imageMetadata);

		// console.log("PROPERTY", validatedProperty);
		// console.log("IMAGEMETADATA", validatedImageMetadata);


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
						category: validatedProperty.category as OperationEnum,
						price: validatedProperty.price,
						description: validatedProperty.description,
						ubication: validatedProperty.ubication,
						type: validatedProperty.type,
						surface: validatedProperty.surface,
						garage: validatedProperty.garage,
						bedrooms: validatedProperty.bedrooms,
						bathrooms: validatedProperty.bathrooms,
						floors: validatedProperty.floors,
						constructedArea: validatedProperty.constructedArea,
						slug: TEMP_SLUG,
					},
				});

				await tx.image.createMany({
					data: uploadedImages.map((img, idx) => ({
						url: img.url,
						position: validatedImageMetadata[idx].position,
						isMain: validatedImageMetadata[idx].isMain,
						idProperty: property.idProperty
					}))
				});

				const slug = crearSlug(
					`${property.category} ${property.description} ${property.idProperty}`
				);

				await tx.property.update({
					where: { idProperty: property.idProperty },
					data: { slug: slug },
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

	async findMany(filters?: PropertyFilters): Promise<PropertyWithImages[]> {
		const where = this.buildWhereClause(filters);

		return await prisma.property.findMany({
			where: Object.keys(where).length > 0 ? where : undefined,
			include: {
				images: { orderBy: { position: 'asc' } }
			}
		});
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

	async PUT(propertyId: number, payload: PutPayload) {
		const { property, existingImages, deletedImageIds, imageFiles, imageMetadata } = payload;

		const parsed = propertyUpdateSchema.safeParse(property);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: "Datos inválidos", errors: parsed.error.flatten() },
				{ status: 422 }
			);
		}

		const imageService = new ImageService();

		let uploaded: { url: string; publicId: string }[] = [];

		try {
			if (imageFiles.length > 0) {
				uploaded = await imageService.uploadMultiple(imageFiles, propertyId, imageMetadata);
			}

			const updatedProperty = await prisma.$transaction(async (tx) => {
				const updated = await tx.property.update({
					where: { idProperty: propertyId },
					data: parsed.data,
				});

				if (deletedImageIds.length > 0) {
					await tx.image.deleteMany({
						where: { idImage: { in: deletedImageIds }, idProperty: propertyId },
					});
				}

				await Promise.all(
					existingImages.map((img) =>
						tx.image.update({
							where: { idImage: img.id },
							data: { position: img.position, isMain: img.isMain },
						})
					)
				);

				if (uploaded.length > 0) {
					await tx.image.createMany({
						data: uploaded.map((u, i) => ({
							url: u.url,
							position: imageMetadata[i].position,
							isMain: imageMetadata[i].isMain,
							idProperty: propertyId,
						})),
					});
				}

				return updated;
			});

			return NextResponse.json(
				{ message: "Propiedad actualizada", property: updatedProperty },
				{ status: 200 }
			);
		} catch (error) {
			if (uploaded.length > 0) {
				await imageService.deleteMultiple(uploaded.map((u) => u.publicId));
			}

			console.error("PUT property failed:", error);
			return NextResponse.json({ message: "Error interno" }, { status: 500 });
		}
	}



	 async GET(id: number) {
		try {
			const property = await prisma.property.findUnique({
			where: { idProperty: id },
			include: {
				images: {
				orderBy: { position: "asc" }, 
				},
			},
			});

			if (!property) {
			return NextResponse.json({ message: "property no encontrada" }, { status: 404 });
			}

			const propertyResponse: PropertyData = {
			id: property.idProperty,
			address: property.address,
			city: property.city || "",
			ubication: property.ubication || "",
			price: property.price,
			description: property.description || "",
			type: property.type,
			category: property.category,
			surface: property.surface,
			bedrooms: property.bedrooms || 0,
			bathrooms: property.bathrooms || 0,
			garage: property.garage || 0,
			floors: property.floors || 0,
			constructed_area: property.constructedArea || 0,

			images: property.images.map((img) => ({
				id: img.idImage,
				url: img.url ?? "",
				position: img.position,     
				isMain: img.isMain,         
			})),
			};

			return NextResponse.json(propertyResponse, { status: 200 });
		} catch (error) {
			console.error("Error al obtener la property:", error);
			return NextResponse.json(
			{ message: "Error al obtener la property" },
			{ status: 500 }
			);
		}
}




}