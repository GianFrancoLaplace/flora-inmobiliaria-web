export const dynamic = "force-dynamic";
export const revalidate = 0;

import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {PropertyUpdateData} from '@/types/property-api.types';
import {PropertyService} from "@/services/property.service";
import {CurrencyEnum, OperationEnum, PropertyTypeEnum, ServiceEnum} from "@/types/prisma";
const propertyService = new PropertyService();


export async function PUT(
	request: NextRequest,
	ctx: { params: Promise<{ id: string }> }
) {
	const contentType = request.headers.get("content-type");
	console.log("PUT /api/properties/[id] content-type:", contentType);
	const { id } = await ctx.params;
	const propertyId = Number(id);

	const formData = await request.formData();

	const servicesRaw = formData.get("services");
	const services = servicesRaw
		? JSON.parse(String(servicesRaw)) as ServiceEnum[]
		: undefined;

	const property: PropertyUpdateData = {
		address: String(formData.get("address") ?? ""),
		city: String(formData.get("city") ?? ""),
		ubication: String(formData.get("ubication") ?? ""),
		description: String(formData.get("description") ?? ""),
		price: Number(formData.get("price")),
		currency: (formData.get("currency") as CurrencyEnum) || CurrencyEnum.USD,
		surface: Number(formData.get("surface")),
		type: formData.get("type") as PropertyTypeEnum,
		category: formData.get("category") as OperationEnum,

		constructed_area: formData.get("constructedArea")
			? Number(formData.get("constructedArea"))
			: undefined,
		bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : undefined,
		bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : undefined,
		garage: formData.get("garage") ? Number(formData.get("garage")) : undefined,
		floors: formData.get("floors") ? Number(formData.get("floors")) : undefined,
		services: services,
	};

	const existingImages = JSON.parse(String(formData.get("existingImages") ?? "[]")) as
		{ id: number; position: number; isMain: boolean }[];

	const deletedImageIds = JSON.parse(String(formData.get("deletedImageIds") ?? "[]")) as number[];

	const imageMetadata = JSON.parse(String(formData.get("imageMetadata") ?? "[]")) as
		{ position: number; isMain: boolean }[];

	const imageFiles = formData.getAll("images") as File[];

	if (imageFiles.length !== imageMetadata.length) {
		return NextResponse.json(
			{ message: "images y imageMetadata no coinciden" },
			{ status: 400 }
		);
	}

	return await propertyService.PUT(propertyId, {
		property,
		existingImages,
		deletedImageIds,
		imageFiles,
		imageMetadata,
	});
}

export async function GET(
	request: NextRequest,
	ctx: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await ctx.params;
		const propertyId = Number(id);

		if (!Number.isInteger(propertyId)) {
			return NextResponse.json({ message: "ID inválido" }, { status: 400 });
		}

		return await propertyService.GET(propertyId);
	} catch (error) {
		console.error("Error al obtener la propiedad:", error);
		return NextResponse.json(
			{ message: "Error al obtener la propiedad" },
			{ status: 500 }
		);
	}
}




export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const propertyId = parseInt(id);

		if (isNaN(propertyId) || propertyId <= 0) {
			return NextResponse.json(
				{ message: "ID inválido" },
				{ status: 400 }
			);
		}

		const property = await prisma.property.findUnique({
			where: { idProperty: propertyId },
		});

		if (!property) {
			return NextResponse.json(
				{ message: "Propiedad no encontrada" },
				{ status: 404 }
			);
		}

		await prisma.property.delete({
			where: { idProperty: propertyId },
		});

		return NextResponse.json(
			{ message: "Propiedad eliminada" },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Error del servidor" },
			{ status: 500 }
		);
	}
}
