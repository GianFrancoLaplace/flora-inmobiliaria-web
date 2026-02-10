import styles from "./SmallCardsGrid.module.css";
import SmallCard from "./SmallCard";
import type { PropertyWithImages } from "@/types/prisma";

type Props = {
	properties: PropertyWithImages[];
};

export default function SmallCardsGrid({ properties }: Props) {
	if (!properties.length) {
		return <p className={styles.empty}>No hay propiedades para mostrar.</p>;
	}

	return (
		<div className={styles.grid}>
			{properties.map((property) => (
				<SmallCard key={property.idProperty} property={property} />
			))}
		</div>
	);
}
