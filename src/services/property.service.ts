import { CreatePropertyDTO } from '@/types/property.types'
import { prisma} from "@/lib/prisma";
import {createPropertySchema} from "@/lib/constants";

export class PropertyService {
	async create(propertyData: CreatePropertyDTO) {
		// Parse & validate en una línea - throws ZodError si falla
		const validated = createPropertySchema.parse(propertyData);

		const property = await prisma.property.create({
			data: {
				address: validated.address,
				city: validated.city,
				category: validated.state,
				price: validated.price,
				description: validated.description,
				ubication: validated.ubication,
				type: validated.type,
				// slug: genera esto como quieras
			}
		});

		return property;
	}

	async buildWhereClause() {
		return await prisma.property.findMany({})
	}
}