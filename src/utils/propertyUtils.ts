import { PropertyTypeEnum, OperationEnum } from "@prisma/client";

export const TYPE_LABELS: Record<PropertyTypeEnum, string> = {
	casa: "Casa",
	departamento: "Departamento",
	campo: "Campo",
	local_comercial: "Local comercial",
	lote: "Lote",
};

export const OPERATION_LABELS: Record<OperationEnum, string> = {
	alquiler: "Alquiler",
	venta: "Venta",
};

type SpecInput = {
	bedrooms?: number | null;
	bathrooms?: number | null;
	garage?: number | null;
	surface?: number | null;
	constructedArea?: number | null;
};

type SpecKey = keyof SpecInput;

const SPECS_BY_TYPE: Record<PropertyTypeEnum, SpecKey[]> = {
	casa: ["bedrooms", "bathrooms", "garage", "surface"],
	departamento: ["bedrooms", "bathrooms", "garage", "surface"],
	campo: ["surface", "constructedArea"],
	local_comercial: ["surface", "constructedArea"],
	lote: ["surface"],
};

export function getVisibleSpecs(
	type: PropertyTypeEnum,
	input: SpecInput
): Partial<SpecInput> {
	const keys = SPECS_BY_TYPE[type];
	const result: Partial<SpecInput> = {};

	for (const key of keys) {
		const value = input[key];
		if (value != null && value > 0) {
			result[key] = value;
		}
	}

	return result;
}

export function buildSpecsLine(
	type: PropertyTypeEnum,
	input: SpecInput
): string {
	const specs = getVisibleSpecs(type, input);
	const parts: string[] = [];

	if (specs.bedrooms) parts.push(`${specs.bedrooms} dorm.`);
	if (specs.bathrooms) parts.push(`${specs.bathrooms} baños`);
	if (specs.garage) parts.push(`${specs.garage} garage`);
	if (specs.surface) parts.push(`${specs.surface} m²`);
	if (specs.constructedArea) parts.push(`${specs.constructedArea} m² cubiertos`);

	return parts.join(" · ");
}