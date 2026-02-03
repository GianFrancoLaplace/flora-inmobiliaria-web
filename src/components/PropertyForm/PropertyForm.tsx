'use client';

import {FormEvent, useState} from 'react';
import styles from './PropertyForm.module.css';
import DescriptionSection from "@/components/PropertyForm/DescriptionSection/DescriptionSection";
import LocationSection from "@/components/PropertyForm/LocationSection/LocationSection";
import DetailsSection from "@/components/PropertyForm/DetailsSection/DetailsSection";
import BasicInfoSection from "@/components/PropertyForm/BasicInfoSection/BasicInfoSection";
import MediaSection from "@/components/PropertyForm/MediaSection/MediaSection";
import {FormMode, PropertyFormInput, PropertyFormProps} from "@/types/property-form.types";
import {createPropertySchema} from "@/validations/property.schema";


export default function PropertyForm({
	                                     mode,
	                                     propertyTitle,
	                                     propertyId,
	                                     initialData,
	                                     onSubmit
                                     }: PropertyFormProps) {

	const defaultFormData: PropertyFormInput = {
		type: undefined,
		category: undefined,
		price: 0,
		surface: 0,
		address: '',
		city: '',
		ubication: '',
		description: '',
		imagePreview: [],
	};

	const [formData, setFormData] = useState<PropertyFormInput>({
		...defaultFormData,
		...initialData,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));

		// Limpiar error del campo cuando el usuario lo modifica
		if (errors[field]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const validate = (): boolean => {
		// Preparar datos para validación - convertir strings vacíos a undefined
		const dataToValidate = {
			...formData,
			city: formData.city?.trim() || undefined,
			ubication: formData.ubication?.trim() || undefined,
			constructedArea: formData.constructedArea || undefined,
			bedrooms: formData.bedrooms || undefined,
			bathrooms: formData.bathrooms || undefined,
			floors: formData.floors || undefined,
			garage: formData.garage || undefined,
		};

		// Validar con Zod
		const result = createPropertySchema.safeParse(dataToValidate);

		if (!result.success) {
			// Convertir errores de Zod al formato del formulario
			const fieldErrors = result.error.flatten().fieldErrors;

			const formattedErrors: Record<string, string> = {};
			Object.entries(fieldErrors).forEach(([field, messages]) => {
				if (messages && messages.length > 0) {
					formattedErrors[field] = messages[0]; // Tomar solo el primer error
				}
			});

			setErrors(formattedErrors);
			return false;
		}

		// Validación exitosa
		setErrors({});
		return true;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validate()) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(formData);
		} catch (error) {
			console.error('Error al guardar:', error);
			setErrors({ submit: 'Hubo un error al guardar la propiedad' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasErrors = Object.keys(errors).length > 0;

	return (
		<div className={styles.formContainer}>

			{/* Header con indicador de modo */}
			<div className={mode === FormMode.EDIT ? styles.headerEdit : styles.headerCreate}>
				<div className={styles.headerContent}>
					<p className={styles.modeTitle}>
						{mode === FormMode.EDIT ? 'Editando propiedad' : 'Nueva propiedad'}
					</p>
					{mode === FormMode.EDIT && propertyTitle && (
						<>
							<p className={styles.propertyTitle}>{propertyTitle}</p>
							{propertyId && (
								<span className={styles.idBadge}>ID: {propertyId}</span>
							)}
						</>
					)}
				</div>
			</div>

			<form onSubmit={handleSubmit} className={styles.form}>

				{/* Resumen de errores */}
				{hasErrors && (
					<div className={styles.errorSummary}>
						<p className={styles.errorTitle}>
							Hay {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'error' : 'errores'} que corregir
						</p>
						<ul className={styles.errorList}>
							{Object.entries(errors).map(([field, message]) => (
								<li key={field}>{message}</li>
							))}
						</ul>
					</div>
				)}

				{/* Secciones del formulario */}
				<BasicInfoSection
					formData={formData}
					onChange={handleChange}
					errors={errors}
				/>

				<DetailsSection
					formData={formData}
					onChange={handleChange}
					errors={errors}
				/>

				<LocationSection
					formData={formData}
					onChange={handleChange}
					errors={errors}
				/>

				<DescriptionSection
					formData={formData}
					onChange={handleChange}
					errors={errors}
				/>

				<MediaSection
					value={formData.imagePreview}
					onChange={(images) => handleChange('images', images)}
					errors={errors}
				/>

				{/* Botones de acción */}
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.btnSecondary}
						onClick={() => window.history.back()}
						disabled={isSubmitting}
					>
						Cancelar
					</button>

					<button
						type="submit"
						className={styles.btnPrimary}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<span className={styles.spinner}></span>
								{mode === FormMode.EDIT ? 'Guardando...' : 'Creando...'}
							</>
						) : (
							mode === FormMode.EDIT ? 'Guardar cambios' : 'Crear propiedad'
						)}
					</button>
				</div>

			</form>
		</div>
	);
}