import styles from './LocalSection.module.css';
import {PropertyData} from "@/types/property.types";

interface LocationSectionProps {
	formData: PropertyData;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function LocationSection({ formData, onChange, errors }: LocationSectionProps) {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Ubicación</h2>

			<div className={styles.grid}>

				{/* Dirección */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="address">
						Dirección <span className={styles.required}>*</span>
					</label>
					<input
						id="address"
						type="text"
						placeholder="Ej: Av. San Martín 1234"
						value={formData.address || ''}
						onChange={(e) => onChange('address', e.target.value)}
						className={errors.address ? styles.inputError : styles.input}
					/>
					{errors.address && (
						<p className={styles.error}>{errors.address}</p>
					)}
				</div>

				{/* Ciudad */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="city">
						Ciudad
					</label>
					<input
						id="city"
						type="text"
						placeholder="Ej: Tandil"
						value={formData.city || ''}
						onChange={(e) => onChange('city', e.target.value)}
						className={styles.input}
					/>
					<p className={styles.hint}>Opcional</p>
				</div>

				{/* Ubicación/Zona */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="ubication">
						Barrio/Zona
					</label>
					<input
						id="ubication"
						type="text"
						placeholder="Ej: Centro, Villa Italia"
						value={formData.ubication || ''}
						onChange={(e) => onChange('ubication', e.target.value)}
						className={styles.input}
					/>
					<p className={styles.hint}>Opcional</p>
				</div>

			</div>
		</section>
	);
}