import {CreateImage, CreatePropertyDTO, ImageMetadata} from '@/types/property.types'
import {prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/lib/constants";
import { crearSlug } from "@/lib/generateSlug"
import {ImageService} from "@/services/image.service";
import {OperationEnum} from "@prisma/client"
import {CloudinaryResult} from "@/types/cloudinary.types";

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

	async buildWhereClause() {
		return await prisma.property.findMany({})
	}
}