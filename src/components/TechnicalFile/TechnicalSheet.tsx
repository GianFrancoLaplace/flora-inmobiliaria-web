import Link from "next/link";
import styles from "./TechnicalSheet.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import ContactInformation from "@/components/features/ContactInformation/ContactInformation";
import PropertyCarousel from "./Carrousel/PropertyCarrousel";
import PropertyItem from "./PropertiesItem";
import type { PropertyWithImages } from "@/types/prisma";

type PropertyViewProps = {
	property: PropertyWithImages;
};

export default function TechnicalSheet({ property }: PropertyViewProps) {
	const operationLabels: Record<string, string> = {
		alquiler: "Alquiler",
		venta: "Venta",
	};

	const typeLabels: Record<string, string> = {
		casa: "Casa",
		departamento: "Departamento",
		campo: "Campo",
		local_comercial: "Local Comercial",
		lote: "Lote",
	};

	const encodedAddress = encodeURIComponent(
		property.address || "Tandil, Buenos Aires, Argentina"
	);

	const opLabel = operationLabels[property.category] ?? property.category;
	const typeLabel = typeLabels[property.type] ?? property.type;

	return (
		<div className={styles.page}>
			<ContactInformation />

			<header className={styles.header}>
				<div className={styles.container}>
					<p className={styles.breadcrumbs}>
						<Link className={styles.breadcrumbLink} href="/propiedades">
							Propiedades
						</Link>
						<span className={styles.breadcrumbSep}>/</span>
						<span className={styles.breadcrumbCurrent}>Ficha</span>
					</p>

					<div className={styles.heroRow}>
						<div className={styles.heroText}>
							<h1 className={styles.title}>{property.address}</h1>

							<div className={styles.metaRow}>
								<span className={styles.badge}>{opLabel}</span>
								<span className={styles.badgeMuted}>{typeLabel}</span>
								{property.ubication ? (
									<span className={styles.metaMuted}>{property.ubication}</span>
								) : null}
							</div>
						</div>

						<div className={styles.priceDesktop}>
							<div className={styles.priceBox}>
								<p className={styles.priceLabel}>Precio</p>
								<p className={styles.priceValue}>
									USD {property.price.toLocaleString("es-AR")}
								</p>

								<Link
									href="https://wa.me/2494208037"
									className={`${styles.ctaBtn} ${cactus.className}`}
									aria-label="Consultar por WhatsApp"
								>
									Consultar
								</Link>

								<p className={styles.ctaHint}>
									Respuesta rápida por WhatsApp.
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className={styles.container}>
				{/* Media */}
				<div className={styles.media}>
					<PropertyCarousel images={property.images} />
				</div>

				{/* Layout 2 columnas */}
				<div className={styles.layout}>
					{/* Columna principal */}
					<div className={styles.content}>
						{/* Precio mobile */}
						<div className={styles.priceMobile}>
							<div className={styles.priceBox}>
								<p className={styles.priceLabel}>Precio</p>
								<p className={styles.priceValue}>
									USD {property.price.toLocaleString("es-AR")}
								</p>
								<Link
									href="https://wa.me/2494208037"
									className={`${styles.ctaBtn} ${cactus.className}`}
									aria-label="Consultar por WhatsApp"
								>
									Consultar
								</Link>
							</div>
						</div>

						{/* Descripción */}
						<section className={styles.sectionCard}>
							<h2 className={styles.sectionTitle}>Descripción</h2>
							<p className={styles.bodyText}>
								{property.description || "Sin descripción."}
							</p>
						</section>

						{/* Ficha técnica */}
						<section className={styles.sectionCard}>
							<h2 className={styles.sectionTitle}>Ficha técnica</h2>

							<div className={styles.featuresGrid}>
								{property.surface ? (
									<PropertyItem
										imgSrc="/icons/sup.png"
										label="Superficie"
										value={`${property.surface} m²`}
									/>
								) : null}

								{property.constructedArea ? (
									<PropertyItem
										imgSrc="/icons/subCub.png"
										label="Sup. cubierta"
										value={`${property.constructedArea} m²`}
									/>
								) : null}

								{property.bedrooms ? (
									<PropertyItem
										imgSrc="/icons/dorms.png"
										label="Dormitorios"
										value={property.bedrooms}
									/>
								) : null}

								{property.bathrooms ? (
									<PropertyItem
										imgSrc="/icons/banos.png"
										label="Baños"
										value={property.bathrooms}
									/>
								) : null}

								{property.garage ? (
									<PropertyItem
										imgSrc="/icons/cochera.png"
										label="Cocheras"
										value={property.garage}
									/>
								) : null}

								{property.floors ? (
									<PropertyItem
										imgSrc="/icons/plantas.png"
										label="Plantas"
										value={property.floors}
									/>
								) : null}
							</div>
						</section>

						{/* Ubicación */}
						<section className={styles.sectionCard}>
							<h2 className={styles.sectionTitle}>Ubicación</h2>
							{property.ubication ? (
								<p className={styles.bodyText}>{property.ubication}</p>
							) : null}

							<div className={styles.mapWrap}>
								<iframe
									title="Mapa de ubicación"
									src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
								/>
							</div>
						</section>
					</div>

					{/* Aside sticky desktop */}
					<aside className={styles.aside}>
						<div className={styles.stickyBox}>
							<p className={styles.priceLabel}>Precio</p>
							<p className={styles.priceValue}>
								USD {property.price.toLocaleString("es-AR")}
							</p>

							<Link
								href="https://wa.me/2494208037"
								className={`${styles.ctaBtn} ${cactus.className}`}
								aria-label="Consultar por WhatsApp"
							>
								Consultar
							</Link>

							<div className={styles.asideMeta}>
								<div className={styles.asideRow}>
									<span className={styles.dot} />
									<span className={styles.asideText}>{opLabel}</span>
								</div>
								<div className={styles.asideRow}>
									<span className={styles.dotMuted} />
									<span className={styles.asideText}>{typeLabel}</span>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
