import styles from "./page.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import HomeF from "@/components/Home/Home";
import FilterGroup from "@/components/FilterButtons/FilterGroup";
import BigCardsGrid from "@/components/BigCards/BigCardsGrid";
import Link from 'next/link';
import { PropertyService } from '@/services/property.service';
import {OperationEnum, PropertyTypeEnum} from "@/types/prisma";

const filtrosTipoPropiedad = [
	"Departamentos",
	"Lotes",
	"Casas",
	"Locales",
	"Campos",
];

type PageProps = {
	searchParams: Promise<{
		tipo?: string;
		operacion?: string;
		maxValue?: string;
	}>;
};

export default async function Page({ searchParams }: PageProps) {
	const propertyService = new PropertyService();

	const params = await searchParams;

	const filters = {
		types: params.tipo?.split(',').filter(Boolean) as PropertyTypeEnum[] | undefined,
		operations: params.operacion?.split(',').filter(Boolean) as OperationEnum[] | undefined,
		maxPrice: params.maxValue ? Number(params.maxValue) : undefined,
	};

	const properties = await propertyService.findMany(filters);

	return (
		<div className={`${styles.page} ${cactus.className} ${styles.container}`}>
			<HomeF />

			<div className={styles.presentationProperties}>
				<h1>Tu próxima propiedad, nuestra prioridad</h1>
				<h5>
					Combinamos experiencia, compromiso y un trato cercano para ayudarte a encontrar el lugar que estás
					buscando. Ya sea que quieras comprar, vender o alquilar, te acompañamos en cada paso con
					asesoramiento personalizado y total transparencia. Descubrí una nueva forma de hacer negocios
					inmobiliarios, centrada en vos.
				</h5>

				<div className={styles.messageButtonProperties}>
					<Link href={"https://wa.me/2494208037"} className={styles.linkProperties}>
						<button className={`${styles.messageBtn} ${cactus.className}`}>
							Enviar un mensaje
						</button>
					</Link>
				</div>

				<div>
					<FilterGroup
						title=""
						filters={filtrosTipoPropiedad}
					/>
				</div>

				<div>
					<BigCardsGrid properties={properties} />
				</div>

				<div className={styles.mainCardsGridProperties}>
					<Link href={"/propiedades"} className={styles.linkProperties}>
						<button className={`${styles.allPropertiesBtn} ${cactus.className}`}>
							Ver todas las propiedades
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}