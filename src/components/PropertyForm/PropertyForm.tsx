'use client';

import { useState, FormEvent } from 'react';
import styles from './PropertyForm.module.css';
import BasicInfoSection from "@/components/PropertyForm/BasicInfoSection/BasicInfoSection";
import DetailsSection from "@/components/PropertyForm/DetailsSection/DetailsSection";
import MediaSection from "@/components/PropertyForm/MediaSection/MediaSection";
import LocationSection from "@/components/PropertyForm/LocationSection/LocationSection";
import DescriptionSection from "@/components/PropertyForm/DescriptionSection/DescriptionSection";

interface PropertyData {
	type: string;
	category: string;
	price: number;
	surface: number;
	description: string;
	address: string;
	ubication?: string;
	city?: string;
	constructedArea?: number;
	bedrooms?: number;
	bathrooms?: number;
	floors?: number;
	garage?: number;
	images: any[];
}

interface PropertyFormProps {
	mode: 'create' | 'edit';
	propertyTitle?: string;
	propertyId?: string;
	initialData?: PropertyData;
	onSubmit: (data: PropertyData) => Promise<void>;
}

export default function PropertyForm({
	                                     mode,
	                                     propertyTitle,
	                                     propertyId,
	                                     initialData,
	                                     onSubmit
                                     }: PropertyFormProps) {

	const [formData, setFormData] = useState<PropertyData>(initialData || {
		type: '',
		category: 'sale',
		price: 0,
		surface: 0,
		description: '',
		address: '',
		images: []
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (field: string, value: any) => {
		setFormData((prev: PropertyData) => ({ ...prev, [field]: value }));

		// Limpiar error cuando usuario modifica el campo
		if (errors[field]) {
			setErrors((prev: Record<string, string>) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Validación básica
		const newErrors: Record<string, string> = {};

		if (!formData.type) newErrors.type = 'Selecciona un tipo de propiedad';
		if (!formData.price || formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
		if (!formData.address) newErrors.address = 'La dirección es obligatoria';
		if (!formData.surface || formData.surface <= 0) newErrors.surface = 'La superficie debe ser mayor a 0';
		if (!formData.description || formData.description.length < 50) {
			newErrors.description = 'La descripción debe tener al menos 50 caracteres';
		}

		// Validaciones específicas por tipo
		if (formData.type === 'house' || formData.type === 'apartment') {
			if (!formData.bedrooms || formData.bedrooms < 1) {
				newErrors.bedrooms = 'Ingresa al menos 1 dormitorio';
			}
			if (!formData.bathrooms || formData.bathrooms < 1) {
				newErrors.bathrooms = 'Ingresa al menos 1 baño';
			}
		}

		if (formData.type === 'house') {
			if (!formData.constructedArea || formData.constructedArea < 1) {
				newErrors.constructedArea = 'La superficie construida es obligatoria';
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(formData);
		} catch (error) {
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasErrors = Object.keys(errors).length > 0;

	return (
		<div className={styles.formContainer}>
			{/* Header con indicador de modo */}
			<div className={mode === 'edit' ? styles.headerEdit : styles.headerCreate}>
				{mode === 'edit' ? (
					<div className={styles.headerContent}>
						<p className={styles.modeTitle}>Editando propiedad</p>
						{propertyTitle && (
							<p className={styles.propertyTitle}>{propertyTitle}</p>
						)}
						{propertyId && (
							<span className={styles.idBadge}>ID: {propertyId}</span>
						)}
					</div>
				) : (
					<div className={styles.headerContent}>
						<p className={styles.modeTitle}>Nueva propiedad</p>
					</div>
				)}
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

				{/* Resumen de errores */}
				{hasErrors && (
					<div className={styles.errorSummary}>
						<p className={styles.errorTitle}>
							Hay {Object.keys(errors).length} errores que corregir:
						</p>
						<ul className={styles.errorList}>
							{Object.entries(errors).map(([field, error]) => (
								<li key={field}>{error?.message as string}</li>
							))}
						</ul>
					</div>
				)}

				<BasicInfoSection />
				<DetailsSection
					formData={formData}
					onChange={handleChange}
					errors={errors}
				/>
				<MediaSection mode={mode} />
				<LocationSection/>
				<DescriptionSection />

				{/* Botones de acción */}
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.btnSecondary}
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

				{/* Indicador de autoguardado */}
				{mode === 'edit' && (
					<p className={styles.draftIndicator}>Borrador guardado automáticamente</p>
				)}
			</form>
		</div>
	);
}