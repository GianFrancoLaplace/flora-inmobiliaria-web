import styles from './DetailsSection.module.css';
import {PropertyFormInput} from "@/types/property-form.types";
import {PropertyTypeEnum, ServiceEnum} from "@/types/prisma";

interface DetailsSectionProps {
	formData: PropertyFormInput;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

const SERVICE_LABELS: Record<ServiceEnum, string> = {
	[ServiceEnum.agua]: 'Agua',
	[ServiceEnum.luz]: 'Luz',
	[ServiceEnum.gas]: 'Gas',
	[ServiceEnum.internet]: 'Internet',
	[ServiceEnum.cloacas]: 'Cloacas',
};

export default function DetailsSection({ formData, onChange, errors }: DetailsSectionProps) {
	const type = formData.type;

	const handleServiceToggle = (service: ServiceEnum) => {
		const currentServices = formData.services || [];
		const newServices = currentServices.includes(service)
			? currentServices.filter(s => s !== service)
			: [...currentServices, service];
		onChange('services', newServices);
	};

	if (!type) {
		return (
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Detalles de la Propiedad</h2>
				<div className={styles.emptyState}>
					<p className={styles.emptyText}>
						Selecciona un tipo de propiedad para continuar
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Detalles de la Propiedad</h2>

			<div className={styles.grid}>

				{/* SUPERFICIE - Todos los tipos */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="surface">
						{type === PropertyTypeEnum.campo ? 'Superficie del terreno (m²)' :
							type === PropertyTypeEnum.casa ? 'Superficie del lote (m²)' :
								'Superficie total (m²)'}
						<span className={styles.required}>*</span>
					</label>
					<input
						id="surface"
						type="number"
						min="0"
						placeholder="0"
						value={formData.surface || ''}
						onChange={(e) => onChange('surface', Number(e.target.value))}
						className={errors.surface ? styles.inputError : styles.input}
					/>
					{errors.surface && (
						<p className={styles.error}>{errors.surface}</p>
					)}
				</div>

				{/* SUPERFICIE CONSTRUIDA - Solo casa */}
				{type === PropertyTypeEnum.casa && (
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="constructedArea">
							Superficie construida (m²) <span className={styles.required}>*</span>
						</label>
						<input
							id="constructedArea"
							type="number"
							min="0"
							placeholder="0"
							value={formData.constructedArea || ''}
							onChange={(e) => onChange('constructedArea', Number(e.target.value))}
							className={errors.constructedArea ? styles.inputError : styles.input}
						/>
						{errors.constructedArea && (
							<p className={styles.error}>{errors.constructedArea}</p>
						)}
						<p className={styles.hint}>
							Debe ser menor o igual a la superficie del lote
						</p>
					</div>
				)}

				{/* DORMITORIOS - Casa y Departamento */}
				{(type === PropertyTypeEnum.casa || type === PropertyTypeEnum.departamento) && (
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="bedrooms">
							Dormitorios <span className={styles.required}>*</span>
						</label>
						<input
							id="bedrooms"
							type="number"
							min="1"
							placeholder="0"
							value={formData.bedrooms || ''}
							onChange={(e) => onChange('bedrooms', Number(e.target.value))}
							className={errors.bedrooms ? styles.inputError : styles.input}
						/>
						{errors.bedrooms && (
							<p className={styles.error}>{errors.bedrooms}</p>
						)}
					</div>
				)}

				{/* BAÑOS - Casa y Departamento */}
				{(type === PropertyTypeEnum.casa || type === PropertyTypeEnum.departamento) && (
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="bathrooms">
							Baños <span className={styles.required}>*</span>
						</label>
						<input
							id="bathrooms"
							type="number"
							min="1"
							placeholder="0"
							value={formData.bathrooms || ''}
							onChange={(e) => onChange('bathrooms', Number(e.target.value))}
							className={errors.bathrooms ? styles.inputError : styles.input}
						/>
						{errors.bathrooms && (
							<p className={styles.error}>{errors.bathrooms}</p>
						)}
					</div>
				)}

				{/* PLANTAS - Solo casa (opcional) */}
				{type === PropertyTypeEnum.casa && (
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="floors">
							Plantas
						</label>
						<input
							id="floors"
							type="number"
							min="1"
							placeholder="1"
							value={formData.floors || ''}
							onChange={(e) => onChange('floors', Number(e.target.value))}
							className={styles.input}
						/>
						<p className={styles.hint}>Opcional</p>
					</div>
				)}

				{/* COCHERAS - Casa y Departamento (opcional) */}
				{(type === PropertyTypeEnum.casa || type === PropertyTypeEnum.departamento) && (
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="garage">
							Cocheras
						</label>
						<input
							id="garage"
							type="number"
							min="0"
							placeholder="0"
							value={formData.garage || ''}
							onChange={(e) => onChange('garage', Number(e.target.value))}
							className={styles.input}
						/>
						<p className={styles.hint}>Opcional</p>
					</div>
				)}

			</div>

			{/* SERVICIOS - Todos los tipos (opcional) */}
			<div className={styles.servicesSection}>
				<label className={styles.label}>
					Servicios disponibles
				</label>
				<p className={styles.hint}>Opcional - Selecciona los servicios que tiene la propiedad</p>
				<div className={styles.checkboxGrid}>
					{Object.values(ServiceEnum).map((service) => (
						<label key={service} className={styles.checkboxLabel}>
							<input
								type="checkbox"
								checked={formData.services?.includes(service) || false}
								onChange={() => handleServiceToggle(service)}
								className={styles.checkbox}
							/>
							<span>{SERVICE_LABELS[service]}</span>
						</label>
					))}
				</div>
			</div>
		</section>
	);
}