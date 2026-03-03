import { PropertyService } from '@/services/property.service';
import Admns from '@/components/Administracion/Administration';
import ContactInformation from '@/components/features/ContactInformation/ContactInformation';
import '../ui/fonts';
import styles from './adminStyles.module.css';
import UnifiedFilter from '@/components/FilterPropertiesAdmin/UnifiedFilter';
import { CurrencyEnum, PropertyTypeEnum, OperationEnum } from '@/types/prisma';

type PageProps = {
	searchParams: Promise<{
		tipo?: string;
		operacion?: string;
		maxValue?: string;
		currency?: string;
	}>;
};

export default async function AdminPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const propertyService = new PropertyService();

	const filters = {
		types: params.tipo?.split(',').filter(Boolean) as PropertyTypeEnum[] | undefined,
		operations: params.operacion?.split(',').filter(Boolean) as OperationEnum[] | undefined,
		maxPrice: params.maxValue ? Number(params.maxValue) : undefined,
		currency: params.currency as CurrencyEnum | undefined,
	};

	const properties = await propertyService.findMany(filters);

	return (
		<div className={styles.container}>
			<main>
				<ContactInformation />
			</main>
			<br/>

			<div>
				<div className={styles.propertiesLayoutFilter}>
					<div className={styles.propertiesLayoutFilters}>
						<UnifiedFilter />
					</div>
					<div className={styles.containerContentRight}>
						<Admns properties={properties} />
					</div>
				</div>
			</div>
		</div>
	);
}
