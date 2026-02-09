import {OperationEnum, PropertyTypeEnum} from "@/types/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import {ZodError} from "zod";
import {PropertyService} from "@/services/property.service";
import { NextRequest, NextResponse } from 'next/server';
import { ImageMetadata } from '@/types/image.types'
import { CreatePropertyDto } from "@/types/property-api.types";

const propertyService = new PropertyService();

export async function POST(request: NextRequest) {
  try {
	  // console.log("LOG DEL POST");

	  const formData = await request.formData();

	  const createPropertyDTO: CreatePropertyDto = {
		  address: formData.get("address") as string,
		  city: formData.get("city") as string,
		  category: formData.get("category") as OperationEnum,
		  price: Number(formData.get("price")),
		  description: formData.get("description") as string,
		  ubication: formData.get("ubication") as string,
		  type: formData.get("type") as PropertyTypeEnum,
		  surface: Number(formData.get("surface")),

		  // opcionales
		  garage: formData.get("garage")
			  ? Number(formData.get("garage"))
			  : undefined,

		  bedrooms: formData.get("bedrooms")
			  ? Number(formData.get("bedrooms"))
			  : undefined,

		  bathrooms: formData.get("bathrooms")
			  ? Number(formData.get("bathrooms"))
			  : undefined,

		  floors: formData.get("floors")
			  ? Number(formData.get("floors"))
			  : undefined,

		  constructedArea: formData.get("constructed_area")
			  ? Number(formData.get("constructed_area"))
			  : undefined,
	  };

	  const imageFiles = formData.getAll("images") as File[];

	  const rawMetadata = formData.get("imageMetadata");

	  if (!rawMetadata || typeof rawMetadata !== "string") {
		  return NextResponse.json(
			  { error: "imageMetadata inválido" },
			  { status: 400 }
		  );
	  }

	  const imageMetadata: ImageMetadata[] = JSON.parse(
		  rawMetadata
	  );

	  // console.log(imageFiles.length !== imageMetadata.length);

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
		  console.error(error.errors);
		  return NextResponse.json(
			  { errors: error.errors },
			  { status: 400 }
		  );
	  }

	  // console.error('Error en POST /api/properties:', error);

	  return NextResponse.json(
		  { error: 'Error interno ' + error },
		  { status: 500 }
	  );
  }
}