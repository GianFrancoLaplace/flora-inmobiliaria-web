'use client';

import { useState, FormEvent } from 'react';
import styles from './PropertyForm.module.css';
import DescriptionSection from "@/components/PropertyForm/DescriptionSection/DescriptionSection";
import LocationSection from "@/components/PropertyForm/LocationSection/LocationSection";
import DetailsSection from "@/components/PropertyForm/DetailsSection/DetailsSection";
import BasicInfoSection from "@/components/PropertyForm/BasicInfoSection/BasicInfoSection";
import MediaSection from "@/components/PropertyForm/MediaSection/MediaSection";
import {PropertyData, PropertyFormProps} from "@/types/property.types";


export default function PropertyForm({
	                                     mode,
	                                     propertyTitle,
	                                     propertyId,
	                                     initialData,
	                                     onSubmit
                                     }: PropertyFormProps) {

	const [formData, setFormData] = useState<PropertyData>({
		type: '',
		category: 'sale',
		price: 0,
		surface: 0,
		address: '',
		description: '',
		images: [],
		...initialData
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
		const newErrors: Record<string, string> = {};

		// Validaciones básicas
		if (!formData.type) {
			newErrors.type = 'Selecciona un tipo de propiedad';
		}
		if (!formData.price || formData.price <= 0) {
			newErrors.price = 'El precio debe ser mayor a 0';
		}
		if (!formData.surface || formData.surface <= 0) {
			newErrors.surface = 'La superficie debe ser mayor a 0';
		}
		if (!formData.address || formData.address.trim().length < 5) {
			newErrors.address = 'Ingresa una dirección válida';
		}
		if (!formData.description || formData.description.trim().length < 50) {
			newErrors.description = 'La descripción debe tener al menos 50 caracteres';
		}

		// Validaciones específicas por tipo de propiedad
		if (formData.type === 'house' || formData.type === 'apartment') {
			if (!formData.bedrooms || formData.bedrooms < 1) {
				newErrors.bedrooms = 'Ingresa al menos 1 dormitorio';
			}
			if (!formData.bathrooms || formData.bathrooms < 1) {
				newErrors.bathrooms = 'Ingresa al menos 1 baño';
			}
		}

		if (formData.type === 'house') {
			if (!formData.constructedArea || formData.constructedArea <= 0) {
				newErrors.constructedArea = 'La superficie construida es obligatoria para casas';
			}
			if (formData.constructedArea && formData.surface && formData.constructedArea > formData.surface) {
				newErrors.constructedArea = 'La superficie construida no puede ser mayor al lote';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
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
			<div className={mode === 'edit' ? styles.headerEdit : styles.headerCreate}>
				<div className={styles.headerContent}>
					<p className={styles.modeTitle}>
						{mode === 'edit' ? 'Editando propiedad' : 'Nueva propiedad'}
					</p>
					{mode === 'edit' && propertyTitle && (
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
							⚠️ Hay {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'error' : 'errores'} que corregir
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
					formData={formData}
					onChange={handleChange}
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
								{mode === 'edit' ? 'Guardando...' : 'Creando...'}
							</>
						) : (
							mode === 'edit' ? 'Guardar cambios' : 'Crear propiedad'
						)}
					</button>
				</div>

			</form>
		</div>
	);
}