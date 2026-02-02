import styles from './BasicInfoSection.module.css';
import {PropertyData} from "@/types/property.types";

interface BasicInfoSectionProps {
	formData: PropertyData;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function BasicInfoSection({ formData, onChange, errors }: BasicInfoSectionProps) {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Datos Básicos</h2>

			<div className={styles.grid}>

				{/* Tipo de operación */}
				<div className={styles.formGroup}>
					<label className={styles.label}>
						Operación <span className={styles.required}>*</span>
					</label>
					<div className={styles.radioGroup}>
						<label className={styles.radioLabel}>
							<input
								type="radio"
								name="category"
								value="sale"
								checked={formData.category === 'sale'}
								onChange={(e) => onChange('category', e.target.value)}
								className={styles.radio}
							/>
							<span>Venta</span>
						</label>
						<label className={styles.radioLabel}>
							<input
								type="radio"
								name="category"
								value="rent"
								checked={formData.category === 'rent'}
								onChange={(e) => onChange('category', e.target.value)}
								className={styles.radio}
							/>
							<span>Alquiler</span>
						</label>
					</div>
				</div>

				{/* Tipo de propiedad */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="type">
						Tipo de propiedad <span className={styles.required}>*</span>
					</label>
					<select
						id="type"
						value={formData.type}
						onChange={(e) => onChange('type', e.target.value)}
						className={errors.type ? styles.selectError : styles.select}
					>
						<option value="">Seleccionar tipo</option>
						<option value="apartment">Departamento</option>
						<option value="house">Casa</option>
						<option value="land">Terreno</option>
					</select>
					{errors.type && (
						<p className={styles.error}>{errors.type}</p>
					)}
				</div>

				{/* Precio */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="price">
						Precio <span className={styles.required}>*</span>
					</label>
					<div className={styles.inputGroup}>
						<span className={styles.currency}>USD</span>
						<input
							id="price"
							type="number"
							min="0"
							step="1000"
							placeholder="0"
							value={formData.price || ''}
							onChange={(e) => onChange('price', Number(e.target.value))}
							className={errors.price ? styles.inputError : styles.input}
						/>
					</div>
					{errors.price && (
						<p className={styles.error}>{errors.price}</p>
					)}
					<p className={styles.hint}>
						Precio en dólares estadounidenses
					</p>
				</div>

			</div>
		</section>
	);
}