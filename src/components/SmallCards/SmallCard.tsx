import Image from "next/image";
import styles from './SmallCard.module.css';
import Link from "next/link";
import {PropertyTypes, PropertyState} from "@/types/property.types";

type Props = {
    imageSrc: string;
    property: PropertyTypes;
    rooms: number;
    dorms: number;
    bathrooms: number;
    showLabel?: boolean;
};

export default function SmallCard({imageSrc, property, rooms, dorms, bathrooms}:Props){

	const showLabel = Object.values(PropertyState).includes(property.state)

    return (
        <main className={styles.card}>
            {showLabel && <div className={styles.addedLabel}>{property.state}</div>}
            <Link href={`/propiedades/ficha/${property.slug}`}>
                <Image
                    src={imageSrc}
                    alt={`Imagen de la propiedad en ${property.state}`}
                    fill
                    className={styles.cardImage}
                />
            </Link>
            <div className={styles.cardOverlay}>
                <h3 className={styles['cardPriceStatus']}>
                    USD {property.price} | {property.state}
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

