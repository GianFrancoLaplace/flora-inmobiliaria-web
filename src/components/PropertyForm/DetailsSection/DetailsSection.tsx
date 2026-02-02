import styles from './DetailsSection.module.css';

interface DetailsSectionProps {
	formData: any;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function DetailsSection({ formData, onChange, errors }: DetailsSectionProps) {
	const type = formData.type;

	if (!type) {
		return (
			<section className={styles.section}>
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

				{/* SUPERFICIE */}
				<div className={styles.formGroup}>
					<label className={styles.label}>
						{type === 'land' ? 'Superficie del terreno (m²)' :
							type === 'house' ? 'Superficie del lote (m²)' :
								'Superficie total (m²)'}
						<span className={styles.required}>*</span>
					</label>
					<input
						type="number"
						placeholder="0"
						value={formData.surface || ''}
						onChange={(e) => onChange('surface', Number(e.target.value))}
						className={errors.surface ? styles.inputError : styles.input}
					/>
					{errors.surface && (
						<p className={styles.error}>⚠️ {errors.surface}</p>
					)}
				</div>

				{/* SUPERFICIE CONSTRUIDA - SOLO CASA */}
				{type === 'house' && (
					<div className={styles.formGroup}>
						<label className={styles.label}>
							Superficie construida (m²) <span className={styles.required}>*</span>
						</label>
						<input
							type="number"
							placeholder="0"
							value={formData.constructedArea || ''}
							onChange={(e) => onChange('constructedArea', Number(e.target.value))}
							className={errors.constructedArea ? styles.inputError : styles.input}
						/>
						{errors.constructedArea && (
							<p className={styles.error}>⚠️ {errors.constructedArea}</p>
						)}
					</div>
				)}

				{/* DORMITORIOS - CASA Y DEPARTAMENTO */}
				{(type === 'house' || type === 'apartment') && (
					<div className={styles.formGroup}>
						<label className={styles.label}>
							Dormitorios <span className={styles.required}>*</span>
						</label>
						<input
							type="number"
							min="0"
							placeholder="0"
							value={formData.bedrooms || ''}
							onChange={(e) => onChange('bedrooms', Number(e.target.value))}
							className={errors.bedrooms ? styles.inputError : styles.input}
						/>
						{errors.bedrooms && (
							<p className={styles.error}>⚠️ {errors.bedrooms}</p>
						)}
					</div>
				)}

				{/* BAÑOS - CASA Y DEPARTAMENTO */}
				{(type === 'house' || type === 'apartment') && (
					<div className={styles.formGroup}>
						<label className={styles.label}>
							Baños <span className={styles.required}>*</span>
						</label>
						<input
							type="number"
							min="1"
							placeholder="0"
							value={formData.bathrooms || ''}
							onChange={(e) => onChange('bathrooms', Number(e.target.value))}
							className={errors.bathrooms ? styles.inputError : styles.input}
						/>
						{errors.bathrooms && (
							<p className={styles.error}>⚠️ {errors.bathrooms}</p>
						)}
					</div>
				)}

				{/* PLANTAS - SOLO CASA */}
				{type === 'house' && (
					<div className={styles.formGroup}>
						<label className={styles.label}>Plantas</label>
						<input
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

				{/* COCHERAS - CASA Y DEPARTAMENTO */}
				{(type === 'house' || type === 'apartment') && (
					<div className={styles.formGroup}>
						<label className={styles.label}>Cocheras</label>
						<input
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