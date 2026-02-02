import styles from './DescriptionSection.module.css';
import {PropertyData} from "@/types/property.types";

interface DescriptionSectionProps {
	formData: PropertyData;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function DescriptionSection({ formData, onChange, errors }: DescriptionSectionProps) {
	const maxCharacters = 200;
	const charCount = formData.description?.length || 0;

	const handleDescriptionChange = (value: string) => {
		if (value.length <= maxCharacters) {
			onChange('description', value);
		}
	};

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Descripción</h2>

			<div className={styles.formGroup}>
				<label className={styles.label} htmlFor="description">
					Descripción de la propiedad <span className={styles.required}>*</span>
				</label>
				<textarea
					id="description"
					rows={8}
					placeholder="Describe las características principales de la propiedad, sus ambientes, estado, ubicación y puntos destacados..."
					value={formData.description || ''}
					onChange={(e) => handleDescriptionChange(e.target.value)}
					className={errors.description ? styles.textareaError : styles.textarea}
				/>
				{errors.description && (
					<p className={styles.error}>{errors.description}</p>
				)}
				<div className={styles.textareaFooter}>
					<p className={styles.hint}>
						Mínimo 50 caracteres. Sé detallado pero conciso.
					</p>
					<span className={styles.charCounter}>
						{charCount} / {maxCharacters}
					</span>
				</div>
			</div>
		</section>
	);
}