import {CurrencyEnum, OperationEnum, PropertyTypeEnum, ServiceEnum} from "@/types/prisma";

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
		const formData = await request.formData();

		const servicesRaw = formData.get("services");
		const services = servicesRaw
			? JSON.parse(String(servicesRaw)) as ServiceEnum[]
			: undefined;

		const getRequiredString = (value: FormDataEntryValue | null) => {
			if (typeof value !== "string") return "";
			return value.trim();
		};
		const getOptionalString = (value: FormDataEntryValue | null) => {
			if (typeof value !== "string") return undefined;
			const trimmed = value.trim();
			return trimmed.length > 0 ? trimmed : undefined;
		};

		const createPropertyDTO: CreatePropertyDto = {
			address: String(formData.get("address") ?? ""),
			city: getRequiredString(formData.get("city")),
			// Backward compatibility: some clients/tests still send "state"
			category: (formData.get("category") ?? formData.get("state")) as OperationEnum,
			price: Number(formData.get("price")),
			currency: (formData.get("currency") as CurrencyEnum) || CurrencyEnum.USD,
			description: formData.get("description") as string,
			ubication: getOptionalString(formData.get("ubication")),
			type: formData.get("type") as PropertyTypeEnum,
			surface: Number(formData.get("surface")),

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

			// Backward compatibility between snake_case and camelCase payloads
			constructedArea: (formData.get("constructed_area") ?? formData.get("constructedArea"))
				? Number(formData.get("constructed_area") ?? formData.get("constructedArea"))
				: undefined,

			services: services,
		};

		const imageFiles = formData.getAll("images") as File[];

		const rawMetadata = formData.get("imageMetadata");
		let imageMetadata: ImageMetadata[] = [];

		if (rawMetadata) {
			if (typeof rawMetadata !== "string") {
				return NextResponse.json(
					{ error: "imageMetadata inválido" },
					{ status: 400 }
				);
			}
			try {
				imageMetadata = JSON.parse(rawMetadata) as ImageMetadata[];
			} catch {
				return NextResponse.json(
					{ error: "imageMetadata inválido" },
					{ status: 400 }
				);
			}
		} else if (imageFiles.length > 0) {
			return NextResponse.json(
				{ error: "imageMetadata inválido" },
				{ status: 400 }
			);
		}

if (imageFiles.length !== imageMetadata.length) {
			return NextResponse.json(
				{error: "Cantidad de imÃ¡genes y metadata no coincide"},
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

		if (error instanceof Error && error.message.startsWith("IMAGE_FORMAT_ERROR:")) {
			return NextResponse.json(
				{ error: error.message.replace("IMAGE_FORMAT_ERROR:", "").trim() },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: 'Error interno' },
			{ status: 500 }
		);
	}
}




