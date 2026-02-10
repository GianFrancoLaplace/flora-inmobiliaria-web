"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./BigCard.module.css";

type Img = { url?: string | null; isMain?: boolean | null };
type PropertyLike = {
    idProperty?: number;
    id?: number;
    slug?: string | null;
    price?: number | null;
    category?: string | null;
    type?: string | null;
    address?: string | null;
    city?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
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
    const operation = property.category ?? "";
    const addressLine = [property.address, property.city].filter(Boolean).join(", ");
    const bedrooms = property.bedrooms ?? 0;
    const bathrooms = property.bathrooms ?? 0;

    return (
        <Link href={href} className={styles.page} aria-label="Ver propiedad">
            {label ? <span className={styles.addedLabel}>{label}</span> : null}

            {/* Wrapper SI o SI para next/image fill */}
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
                        USD {price.toLocaleString("es-AR")} <span className={styles.sep}>|</span>{" "}
                        {operation || "operación"}
                    </h3>
                </div>

                <p className={styles.address}>{addressLine || "Tandil"}</p>

                <p className={styles.specs}>
                    {bedrooms} dormitorios <span className={styles.sep}>|</span> {bathrooms} baños
                </p>
            </div>
        </Link>
    );
}
