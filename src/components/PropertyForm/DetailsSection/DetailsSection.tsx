import styles from './DetailsSection.module.css';
import {PropertyFormInput} from "@/types/property-form.types";
import {PropertyTypeEnum} from "@/types/prisma";

interface DetailsSectionProps {
	formData: PropertyFormInput;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function DetailsSection({ formData, onChange, errors }: DetailsSectionProps) {
	const type = formData.type;

	// Estado vacío si no hay tipo seleccionado
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
		</section>
	);
}