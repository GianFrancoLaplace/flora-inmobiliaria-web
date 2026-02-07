import styles from './BigCard.module.css';
import { cactus } from "@/app/(views)/ui/fonts";
import BigCard from "@/components/BigCards/BigCard";
import { PropertyWithImages } from '@/types/prisma';

type Props = {
	properties: PropertyWithImages[];
};

export default function BigCardsGrid({ properties }: Props) {

	{/* TODO: esto es provisorio */}
	if (!properties){
		return (
			<main className={`${styles.grid} ${cactus.className}`}>
				<div className={styles.noResults}>
					No se encontraron propiedades
				</div>
			</main>
		);
	}

	if (properties.length === 0) {
		return (
			<main className={`${styles.grid} ${cactus.className}`}>
				<div className={styles.noResults}>
					No se encontraron propiedades
				</div>
			</main>
		);
	}

	return (
		<main className={`${styles.grid} ${cactus.className}`}>
			{properties.map((property) => (
				<BigCard
					key={property.idProperty}
					slug={property.slug}
					imageSrc={property.images[0]?.url || "/backgrounds/notImage.jpg"}
					price={property.price}
					transaction={property.category}
					adress={property.address}
					city={property.city || "Tandil"}
					rooms={property.bedrooms || 0}
					dorms={property.bedrooms || 0}
					bathrooms={property.bathrooms || 0}
				/>
			))}
		</main>
	);
}