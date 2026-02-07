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
import {usePropertySubmit} from "@/hooks/usePropertySubmit";
import {ImageItem} from "@/types/image.types";
import { useRouter } from 'next/navigation';
import {getBaseUrl} from "@/lib/baseURL";
import {CheckIcon} from "lucide-react";

export default function PropertyForm({
	                                     mode,
	                                     propertyTitle,
	                                     propertyId,
	                                     initialData,
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
		images: [],
		deletedImageIds: []
	};

	// const defaultFormData: PropertyFormInput = {
	// 	type: PropertyTypeEnum.casa,
	// 	category: OperationEnum.venta,
	// 	price: 1000,
	// 	surface: 1000,
	// 	address: 'Av. Perón 123',
	// 	city: 'Tandil',
	// 	ubication: 'Calamuchita',
	// 	description: 'Una gran casa peronista',
	// 	images: [],
	// 	deletedImageIds: []
	// };

	const [formData, setFormData] = useState<PropertyFormInput>({
		...defaultFormData,
		...initialData,
	});

	const { submit } = usePropertySubmit()
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const router = useRouter();

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({...prev, [field]: value}));

		if (errors[field]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleImagesChange = (newImages: ImageItem[]) => {
		const existingImages = formData.images.filter(img => img.type === 'existing');
		const remainingExistingImages = newImages.filter(img => img.type === 'existing');

		const deletedIds = existingImages
			.filter(existing => !remainingExistingImages.some(remaining =>
				remaining.type === 'existing' && remaining.id === existing.id
			))
			.map(img => img.id);

		setFormData(prev => ({
			...prev,
			images: newImages,
			deletedImageIds: [...prev.deletedImageIds, ...deletedIds]
		}));

		if (errors.images) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors.images;
				return newErrors;
			});
		}
	};

	const validate = (): boolean => {
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

		const result = createPropertySchema.safeParse(dataToValidate);

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			const formattedErrors: Record<string, string> = {};

			Object.entries(fieldErrors).forEach(([field, messages]) => {
				if (messages && messages.length > 0) {
					formattedErrors[field] = messages[0];
				}
			});

			setErrors(formattedErrors);
			return false;
		}

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
			if (mode === FormMode.CREATE) {
				await submitCreate();
			} else {
				await submitEdit();
			}

			setIsSuccess(true);
			window.scrollTo({ top: 0, behavior: 'smooth' });

			// Redirigir después de 2 segundos a la lista de propiedades o al detalle
			setTimeout(() => {
				router.replace(getBaseUrl() + '/administracion');
				router.refresh();
			}, 2000);
		} catch (error) {
			console.error('Error al guardar:', error);
			setErrors({ submit: 'Hubo un error al guardar la propiedad' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitCreate = async () => {
		await submit(formData, FormMode.CREATE);
	};

	const submitEdit = async () => {
		// propertyId debe venir de las props
		if (!propertyId) {
			throw new Error('Property ID es requerido para editar');
		}
		await submit(formData, FormMode.EDIT, propertyId);
	};

	const hasErrors = Object.keys(errors).length > 0;

	if (isSuccess) {
		return (
			<div className={styles.successContainer}>
				<div className={styles.successCard}>
					<div className={styles.successIcon}>  <CheckIcon /></div>
					<h2>¡Operación exitosa!</h2>
					<p>La propiedad ha sido {mode === FormMode.CREATE ? 'creada' : 'actualizada'} correctamente.</p>
					<p className={styles.redirectText}>Redirigiendo al panel...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.formContainer}>
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
					value={formData.images}
					onChange={handleImagesChange}
					errors={errors}
				/>

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