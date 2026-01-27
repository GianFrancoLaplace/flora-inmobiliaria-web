import {CreateImage, CreatePropertyDTO, ImageMetadata} from '@/types/property.types'
import {prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/lib/constants";
import {ImageService} from "@/services/image.service";
import {OperationEnum} from "@prisma/client"

export interface CreatePropertyWithImages {
	data: CreatePropertyDTO;
	images: CreateImage[];
}

export class PropertyService {

	imageService: ImageService;

	constructor() {
		this.imageService = new ImageService();
	}

	async create(propertyData : CreatePropertyWithImages) {
		// Parse & validate en una línea - throws ZodError si falla
		const validated = createPropertySchema.parse(propertyData);

		const property = await prisma.property.create({
			data: {
				address: validated.address,
				city: validated.city,
				category: validated.state as OperationEnum, // TODO: Desharcodear
				price: validated.price,
				description: validated.description,
				ubication: validated.ubication,
				type: validated.type,
				// slug: genera esto como quieras
			}
		});

		const files = propertyData.images.map(image => image.file);

		const metadata : ImageMetadata[] = propertyData.images.map(
			({ isMain, position, url, altText }) => ({ isMain, position, url, altText })
		);
	}

	async buildWhereClause() {
		return await prisma.property.findMany({})
	}
}