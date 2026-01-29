export const dynamic = "force-dynamic";
export const revalidate = 0;

import {ZodError} from "zod";
import {PropertyService} from "@/services/property.service";
import { NextRequest, NextResponse } from 'next/server';
import {
	CreatePropertyDTO,
	PropertyState,
	PropertyType,
	ImageMetadata,
	CreateImage
} from '@/types/property.types';

type PriceFilter = {
    lte?: number;
    gte?: number;
};

const propertyService = new PropertyService();

/**
 * GET /api/properties
 * Soporta filtros: tipo, operacion, minValue, maxValue
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		// Parsear filtros del query string
		const types = searchParams.get('tipo')
			?.split(',')
			.filter(Boolean) as PropertyType[] | undefined;

		const operations = searchParams.get('operacion')
			?.split(',')
			.filter(Boolean) as PropertyState[] | undefined;

		const minValue = searchParams.get('minValue');
		const maxValue = searchParams.get('maxValue');

		// Construir objeto de filtros
		const filters = {
			types,
			operations,
			minPrice: minValue ? Number(minValue) : undefined,
			maxPrice: maxValue ? Number(maxValue) : undefined,
		};

		const properties = await propertyService.findMany(filters);

		return NextResponse.json(properties);
	} catch (error) {
		console.error('Error en GET /api/properties:', error);
		return NextResponse.json(
			{ error: 'Error al obtener propiedades' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
  try {
	  const formData = await request.formData();

	  const createPropertyDTO: CreatePropertyDTO = {
		  address: formData.get("address") as string,
		  city: formData.get("city") as string,
		  state: formData.get("state") as PropertyState,
		  price: Number(formData.get("price")),
		  description: formData.get("description") as string,
		  ubication: formData.get("ubication") as string,
		  type: formData.get("type") as PropertyType,
	  };

	  const imageFiles = formData.getAll("images") as File[];

	  const imageMetadata: ImageMetadata[] = JSON.parse(
		  formData.get("imageMetadata") as string
	  );

	  console.log(imageFiles);
	  console.log(imageMetadata);

	  console.log(imageFiles.length !== imageMetadata.length);

	  if (imageFiles.length !== imageMetadata.length) {
		  return NextResponse.json(
			  {error: "Cantidad de imágenes y metadata no coincide"},
			  {status: 400}
		  );
	  }

	  const property = await propertyService.create(
		  createPropertyDTO, imageFiles, imageMetadata
	  );

	return NextResponse.json(property, { status: 201 });

  } catch (error) {
	  if (error instanceof ZodError) {
		  return NextResponse.json(
			  { errors: error.errors },
			  { status: 400 }
		  );
	  }

	  return NextResponse.json(
		  { error: 'Error interno' },
		  { status: 500 }
	  );
  }
}