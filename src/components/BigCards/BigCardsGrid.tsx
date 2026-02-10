import BigCard from "./BigCard";
import styles from "./BigCard.module.css";
import type { PropertyWithImages } from "@/types/prisma";

type Props = {
	properties: PropertyWithImages[];
	label?: string;
};

export default function BigCardsGrid({ properties, label }: Props) {
	return (
		<div className={styles.grid}>
			{properties.map((property) => (
				<BigCard key={property.idProperty} property={property} label={label} />
			))}
		</div>
	);
}
