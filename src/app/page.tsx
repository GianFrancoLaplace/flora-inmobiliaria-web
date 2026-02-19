import styles from "./page.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import HomeF from "@/components/Home/Home";
import BigCardsGrid from "@/components/BigCards/BigCardsGrid";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function Page() {
	const properties = await prisma.property.findMany({
		orderBy: { idProperty: "desc" },
		take: 3,
		include: {
			images: {
				orderBy: { position: "asc" },
				take: 1,
			},
		},
	});

	return (
		<div className={`${styles.page} ${cactus.className} ${styles.container}`}>
			<HomeF />

			<section className={styles.presentationProperties}>
				<header className={styles.heroText}>
					<div className={styles.actions}>
						<Link href={"https://wa.me/2494208037"} className={styles.linkProperties}>
							<button className={`${styles.primaryBtn} ${cactus.className}`}>
								Enviar un mensaje
							</button>
						</Link>

						<Link href={"/propiedades"} className={styles.linkProperties}>
							<button className={`${styles.secondaryBtn} ${cactus.className}`}>
								Ver propiedades
							</button>
						</Link>
					</div>
				</header>

				<div className={styles.sectionHeader}>
					<h2>Novedades</h2>
					<p>Últimas propiedades publicadas</p>
				</div>

				<section className={styles.cardsSection}>
					<BigCardsGrid properties={properties} />
				</section>
				<div className={styles.bottomCta}>
					<Link href={"/propiedades"} className={styles.linkProperties}>
						<button className={`${styles.allPropertiesBtn} ${cactus.className}`}>
							Ver todas las propiedades
						</button>
					</Link>
				</div>
			</section>
		</div>
	);
}
