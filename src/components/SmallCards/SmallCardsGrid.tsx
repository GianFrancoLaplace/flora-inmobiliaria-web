import SmallCard from "@/components/SmallCards/SmallCard";
import styles from './SmallCardsGrid.module.css';
import React from "react";
import {PropertyWithImages} from "@/types/prisma"
import {cactus} from "@/app/(views)/ui/fonts";

type Props = {
	properties: PropertyWithImages[];
};

export default function SmallCardsGrid({ properties }: Props) {
	if (properties.length === 0) {
		return (
			<main className={`${styles.propertyGrid} ${cactus.className}`}>
				<div className={styles.noResults}>
					No se encontraron propiedades
				</div>
			</main>
		);
	}

	return (
		<main className={`${styles.propertyGrid} ${cactus.className}`}>
			{properties.map((property) => (
				<SmallCard
					key={property.idProperty}
					property={property}
					imageSrc={property.images[0]?.url || "/backgrounds/notImage.jpg"}
					rooms={property.bedrooms || 0}
					dorms={property.bedrooms || 0}
					bathrooms={property.bathrooms || 0}
				/>
			))}
		</main>
	);
}