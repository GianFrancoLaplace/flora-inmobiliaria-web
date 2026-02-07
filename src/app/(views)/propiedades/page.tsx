import { PropertyService } from '@/services/property.service';
import ContactInformation from "@/components/features/ContactInformation/ContactInformation";
import styles from './propertiesstyles.module.css';
import '../ui/fonts';
import PropertyGrid from "@/components/SmallCards/SmallCardsGrid";
import UnifiedFilter from "@/components/FilterPropertiesAdmin/UnifiedFilter";
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

type PageProps = {
	searchParams: Promise<{
		tipo?: string;
		operacion?: string;
		maxValue?: string;
	}>;
};

export default async function PropertiesPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const propertyService = new PropertyService();

	const filters = {
		types: params.tipo?.split(',').filter(Boolean) as PropertyTypeEnum[] | undefined,
		operations: params.operacion?.split(',').filter(Boolean) as OperationEnum[] | undefined,
		maxPrice: params.maxValue ? Number(params.maxValue) : undefined,
	};

	const properties = await propertyService.findMany(filters);

	return (
		<div className={styles.conteinerPropiedades}>
			<main>
				<ContactInformation />
			</main>
			<br />

			<div className={styles.propertiesLayout}>
				<div className={styles.propertiesLayoutFilter}>
					<UnifiedFilter
					/>
				</div>

				<div className={styles.propertiesLayoutMainContent}>
					{properties.length === 0 ? (
						<div className={styles.noPropertiesContainer}>
							<p>No se encontraron propiedades.</p>
						</div>
					) : (
						<PropertyGrid properties={properties} />
					)}
				</div>
			</div>
		</div>
	);
}