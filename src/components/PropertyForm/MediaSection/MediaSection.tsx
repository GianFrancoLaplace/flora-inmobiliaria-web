"use client"

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './MediaSection.module.css';

interface MediaSectionProps {
	formData: any;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

interface ImagePreview {
	file: File;
	preview: string;
	isMain: boolean;
}

export default function MediaSection({ formData, onChange, errors }: MediaSectionProps) {
	const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFiles = (files: FileList | null) => {
		if (!files) return;

		const validFiles: File[] = [];
		const newPreviews: ImagePreview[] = [];

		Array.from(files).forEach(file => {
			// Validar tipo
			if (!file.type.startsWith('image/')) {
				alert(`${file.name} no es una imagen válida`);
				return;
			}

			// Validar tamaño (5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert(`${file.name} excede el tamaño máximo de 5MB`);
				return;
			}

			validFiles.push(file);

			// Crear preview
			const reader = new FileReader();
			reader.onload = (e) => {
				const preview: ImagePreview = {
					file,
					preview: e.target?.result as string,
					isMain: imagePreviews.length === 0 && newPreviews.length === 0
				};
				newPreviews.push(preview);

				if (newPreviews.length === validFiles.length) {
					setImagePreviews(prev => [...prev, ...newPreviews]);
					onChange('images', [...(formData.images || []), ...validFiles]);
				}
			};
			reader.readAsDataURL(file);
		});
	};

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		handleFiles(e.dataTransfer.files);
	};

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		handleFiles(e.target.files);
	};

	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveImage = (index: number) => {
		const newPreviews = imagePreviews.filter((_, i) => i !== index);
		const newFiles = (formData.images || []).filter((_: any, i: number) => i !== index);

		// Si eliminamos la principal y hay más imágenes, la primera se vuelve principal
		if (imagePreviews[index].isMain && newPreviews.length > 0) {
			newPreviews[0].isMain = true;
		}

		setImagePreviews(newPreviews);
		onChange('images', newFiles);
	};

	const handleSetMainImage = (index: number) => {
		const newPreviews = imagePreviews.map((preview, i) => ({
			...preview,
			isMain: i === index
		}));
		setImagePreviews(newPreviews);

		// Reordenar el array de files para que la principal esté primera
		const newFiles = [...(formData.images || [])];
		const [mainFile] = newFiles.splice(index, 1);
		newFiles.unshift(mainFile);
		onChange('images', newFiles);
	};

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Imágenes</h2>

			<div className={styles.content}>

				{/* Zona de carga */}
				<div
					className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={handleClickUpload}
				>
					<div className={styles.dropzoneContent}>
						<svg
							className={styles.uploadIcon}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
						<p className={styles.dropzoneText}>
							Arrastra imágenes aquí o haz clic para seleccionar
						</p>
						<p className={styles.dropzoneHint}>
							Formatos: JPG, PNG, WEBP (máx. 5MB cada una)
						</p>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept="image/jpeg,image/jpg,image/png,image/webp"
						onChange={handleFileInput}
						className={styles.fileInput}
					/>
				</div>

				{/* Galería de imágenes */}
				{imagePreviews.length > 0 && (
					<div className={styles.gallery}>
						{imagePreviews.map((preview, index) => (
							<div key={index} className={styles.imageCard}>
								<div className={styles.imageWrapper}>
									<img
										src={preview.preview}
										alt={`Imagen ${index + 1}`}
										className={styles.image}
									/>
									<div className={styles.imageOverlay}>
										<button
											type="button"
											onClick={() => handleSetMainImage(index)}
											className={styles.imageBtn}
											title="Marcar como principal"
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
												/>
											</svg>
										</button>
										<button
											type="button"
											onClick={() => handleRemoveImage(index)}
											className={styles.imageBtn}
											title="Eliminar"
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
									{preview.isMain && (
										<span className={styles.mainBadge}>Principal</span>
									)}
								</div>
							</div>
						))}

						{/* Botón para agregar más */}
						<div className={styles.imageCard}>
							<div className={styles.addMoreCard} onClick={handleClickUpload}>
								<svg className={styles.plusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								<p>Agregar más</p>
							</div>
						</div>
					</div>
				)}

				{errors.images && (
					<p className={styles.error}>{errors.images}</p>
				)}

				<p className={styles.hint}>
					{imagePreviews.length === 0
						? 'Sube al menos una imagen de la propiedad'
						: `${imagePreviews.length} imagen${imagePreviews.length > 1 ? 'es' : ''} cargada${imagePreviews.length > 1 ? 's' : ''}`
					}
				</p>

			</div>
		</section>
	);
}