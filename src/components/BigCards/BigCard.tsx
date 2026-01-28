import styles from './BigCard.module.css'
import {cactus} from "@/app/(views)/ui/fonts";
import Image from 'next/image';
import Link from "next/link";

type Props = {
    slug: string,
    imageSrc: string;
    price: number;
    transaction: string;
    adress: string;
    city: string;
    rooms: number;
    dorms: number;
    bathrooms: number;
    showLabel?: boolean;
};

export default function BigCard({slug, imageSrc, price, transaction, adress, city, rooms, dorms, bathrooms}: Props) {
    const showLabel =
        transaction === "VENDIDA" ||
        transaction === "ALQUILADA" ||
        transaction === "Alquilada" ||
        transaction === "alquilada" ||
        transaction === "Vendida" ||
        transaction === "vendida"
    ;

	let parts = [];

	if (rooms) parts.push(`${rooms} ambientes`);
	if (dorms) parts.push(`${dorms} dormitorios`);
	if (bathrooms) parts.push(`${bathrooms} baños`);

	let description = parts.join(" | ");

	console.log(description);

    return (
        <main className={`${styles.page} ${cactus.className}`} style={{position: 'relative'}}>
            {showLabel && <div className={styles.addedLabel}>{transaction.toUpperCase()}</div>}

            <Link href={`/${slug}`}>
                <Image
                    src={imageSrc}
                    alt={'imagen propiedad'}
                    fill
                    className={styles.cardBackground}
                />
            </Link>

            <div className={styles.detailsProperties}>
                <h3>USD {price} | {transaction.toUpperCase()}</h3>
                <div>
                    <h5>{adress}, {city}</h5>
                    <h6>{description}</h6>
                </div>
            </div>
        </main>
    );
}