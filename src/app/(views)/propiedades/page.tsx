import type { PropertyFilters } from "@/types/property.filter.types";
import { CurrencyEnum, OperationEnum, PropertyTypeEnum } from "@/types/prisma";

import ContactInformation from "@/components/features/ContactInformation/ContactInformation";
import PropertiesClient from "./PropertiesClient";
import styles from "./propertiesstyles.module.css";

import { PropertyService } from "@/services/property.service";

type PageProps = {
	searchParams: Record<string, string | string[] | undefined>;
};

function toStringParam(v: string | string[] | undefined): string | undefined {
	if (!v) return undefined;
	return Array.isArray(v) ? v[0] : v;
}

function parseEnumList<T extends string>(value?: string): T[] | undefined {
	if (!value) return undefined;
	const arr = value.split(",").map((s) => s.trim()).filter(Boolean) as T[];
	return arr.length ? arr : undefined;
}

function parseNumber(value?: string): number | undefined {
	if (!value) return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
	const propertyService = new PropertyService();

	const tipoParam = toStringParam(searchParams.tipo);
	const operacionParam = toStringParam(searchParams.operacion);
	const currencyParam = toStringParam(searchParams.currency);

	// soporta ambos nombres por si ya tenías uno:
	const maxValueParam = toStringParam(searchParams.maxValue);
	const minValueParam = toStringParam(searchParams.minValue);

	const types = parseEnumList<PropertyTypeEnum>(tipoParam);
	const operations = parseEnumList<OperationEnum>(operacionParam);

	const maxPrice = parseNumber(maxValueParam);
	const minPrice = parseNumber(minValueParam);

	const filters: PropertyFilters | undefined =
		(types?.length || operations?.length || minPrice !== undefined || maxPrice !== undefined || currencyParam)
			? {
				types,
				operations,
				minPrice,
				maxPrice,
				currency: (currencyParam as CurrencyEnum | undefined),
			}
			: undefined;

	const properties = await propertyService.findMany(filters);

	return (
		<main className={styles.page}>
			<ContactInformation />
			<PropertiesClient properties={properties} />
		</main>
	);
}
