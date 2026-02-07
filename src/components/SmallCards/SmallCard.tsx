import Image from "next/image";
import styles from './SmallCard.module.css';
import Link from "next/link";
import {PropertyTypeEnum, OperationEnum, PropertyWithImages} from "@/types/prisma";

type Props = {
    imageSrc: string;
    property: PropertyWithImages;
    rooms: number;
    dorms: number;
    bathrooms: number;
    showLabel?: boolean;
};

export default function SmallCard({imageSrc, property, rooms, dorms, bathrooms}:Props){

	const showLabel =
		property.category === 'venta' ||
		property.category === 'alquiler';

    return (
        <main className={styles.card}>
            {showLabel && <div className={styles.addedLabel}>{property.category.toUpperCase()}</div>}
            <Link href={`/propiedades/ficha/${property.slug}`}>
                <Image
                    src={imageSrc}
                    alt={`Imagen de la propiedad en ${property.category}`}
                    fill
                    className={styles.cardImage}
                />
            </Link>
            <div className={styles.cardOverlay}>
                <h3 className={styles['cardPriceStatus']}>
                    USD {property.price} | {property.category.toUpperCase()}
                </h3>
                <h5 className={styles.cardAddress}>
                    {property.address}, {property.city}
                </h5>
                <h6 className={styles.cardFeatures}>
                    {rooms} ambientes
                </h6>
                <h6 className={styles.cardFeatures}>
                    {dorms} dormitorios | {bathrooms} baños
                </h6>
            </div>
        </main>
    )
}

