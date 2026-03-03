"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./BigCard.module.css";
import { PropertyTypeEnum, OperationEnum } from "@prisma/client";
import { CurrencyEnum } from "@/types/prisma";
import { TYPE_LABELS, OPERATION_LABELS, buildSpecsLine } from "@/utils/propertyUtils";

type Img = { url?: string | null; isMain?: boolean | null };

type PropertyLike = {
	idProperty?: number;
	id?: number;
	slug?: string | null;
	price?: number | null;
	currency?: CurrencyEnum | null;
	category?: OperationEnum | null;
	type?: PropertyTypeEnum | null;
	address?: string | null;
	city?: string | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	garage?: number | null;
	surface?: number | null;
	constructedArea?: number | null;
	images?: Img[] | null;
};

type Props = {
	property: PropertyLike;
	label?: string;
};

export default function BigCard({ property, label }: Props) {
	if (!property) return null;

	const firstImg =
		property.images?.find((i) => i?.isMain)?.url ||
		property.images?.[0]?.url ||
		"/backgrounds/notImage.jpg";

	const href =
		property.slug
			? `/propiedades/${property.slug}`
			: `/propiedades/ficha/${property.idProperty ?? property.id ?? ""}`;

	const price = property.price ?? 0;
	const currency = property.currency ?? CurrencyEnum.USD;
	const addressLine = [property.address, property.city].filter(Boolean).join(", ");

	// Badge: label externo tiene prioridad, si no hay muestra el tipo
	const badgeText = label ?? (property.type ? TYPE_LABELS[property.type] : null);

	// Operación formateada
	const operationText = property.category
		? OPERATION_LABELS[property.category]
		: "Operación";

	// Specs
	const specsLine = property.type
		? buildSpecsLine(property.type, {
			bedrooms: property.bedrooms,
			bathrooms: property.bathrooms,
			garage: property.garage,
			surface: property.surface,
			constructedArea: property.constructedArea,
		})
		: "";

	return (
		<Link href={href} className={styles.page} aria-label="Ver propiedad">
			{badgeText ? <span className={styles.addedLabel}>{badgeText}</span> : null}

			<div className={styles.imageWrap}>
				<Image
					src={firstImg}
					alt={addressLine || "Propiedad"}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
					className={styles.cardBackground}
					priority={false}
				/>
			</div>

			<div className={styles.detailsProperties}>
				<div className={styles.rowTop}>
					<h3 className={styles.price}>
						{currency} {price.toLocaleString("es-AR")}{" "}
						<span className={styles.sep}>|</span>{" "}
						{operationText}
					</h3>
				</div>

				<p className={styles.address}>{addressLine || "Tandil"}</p>

				{specsLine && (
					<p className={styles.specs}>{specsLine}</p>
				)}
			</div>
		</Link>
	);
}
