import Image from "next/image";
import Link from "next/link";
import styles from "./SmallCard.module.css";
import type { PropertyWithImages } from "@/types/prisma";

type Props = {
    property: PropertyWithImages;
};

const money = (value: number) =>
    new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);

export default function SmallCard({ property }: Props) {
    const imageSrc =
        property.images?.[0]?.url?.trim() ||
        "/backgrounds/homeBackground.jpg";

    const badge = property.category?.toUpperCase?.() || "PROPIEDAD";

    const city = property.city ? `, ${property.city}` : "";
    const title = `${property.address || "Propiedad"}${city}`;

    // Specs “seguros” (si no existen, no rompen)
    const ambientes = (property as any).rooms ?? (property as any).ambientes;
    const dorms = (property as any).dorms ?? (property as any).dormitorios;
    const banios = (property as any).bathrooms ?? (property as any).banos;

    return (
        <Link href={`/propiedades/${property.slug}`} className={styles.card}>
            <div className={styles.media}>
                <Image
                    src={imageSrc}
                    alt={`Imagen de ${title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                    priority={false}
                />

                <div className={styles.badge}>{badge}</div>

                <div className={styles.gradient} />
            </div>

            <div className={styles.body}>
                <div className={styles.topRow}>
                    <p className={styles.price}>
                        {property.price ? `USD ${money(property.price)}` : "Consultar precio"}
                    </p>
                    <span className={styles.pill}>{property.type || "Inmueble"}</span>
                </div>

                <h3 className={styles.title}>{title}</h3>

                <div className={styles.specs}>
                    {ambientes != null && <span className={styles.spec}>🏠 {ambientes} amb.</span>}
                    {dorms != null && <span className={styles.spec}>🛏️ {dorms} dorm.</span>}
                    {banios != null && <span className={styles.spec}>🛁 {banios} baños</span>}
                </div>

                <div className={styles.ctaRow}>
                    <span className={styles.cta}>Ver detalle</span>
                    <span className={styles.arrow}>→</span>
                </div>
            </div>
        </Link>
    );
}
