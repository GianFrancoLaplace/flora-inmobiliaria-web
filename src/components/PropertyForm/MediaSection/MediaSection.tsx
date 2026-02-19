"use client"

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './MediaSection.module.css';
import {ImageItem, NewImage} from "@/types/image.types";
import {
	validateImageFile,
	validateImageFiles
} from '@/validations/image.validation';

interface MediaSectionProps {
	value: ImageItem[];
	onChange: (images: ImageItem[]) => void;
	errors: Record<string, string>;
}

export default function MediaSection({ value, onChange, errors }: MediaSectionProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const fileInputMoreRef = useRef<HTMLInputElement>(null);

	const createPreview = async (file: File): Promise<string> => {
		try {
			return URL.createObjectURL(file);
		} catch {
			return await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(new Error('No se pudo generar la vista previa'));
				reader.readAsDataURL(file);
			});
		}
	};

	const handleFiles = async (files: FileList | null) => {
		if (!files) return;

		const fileArray = Array.from(files);
		const newImages: NewImage[] = [];

		for (let i = 0; i < fileArray.length; i++) {
			const file = fileArray[i];
			const validation = validateImageFile(file);

			if (!validation.valid) {
				alert(`${file.name}: ${validation.error}`);
				continue;
			}

			const newImage: ImageItem = {
				type: 'new',
				file,
				preview: await createPreview(file),
				position: value.length + newImages.length,
				isMain: value.length === 0 && newImages.length === 0
			};

			newImages.push(newImage);
		}

		if (newImages.length > 0) {
			const existingFiles = value
				.filter((img): img is NewImage => img.type === 'new')
				.map(img => img.file);

			const newFiles = newImages.map(img => img.file);
			const allFiles = [...existingFiles, ...newFiles];

			const arrayValidation = validateImageFiles(allFiles);

			if (!arrayValidation.valid) {
				alert(arrayValidation.errors.join('\n'));
				return;
			}

			onChange([...value, ...newImages]);
		}
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
		void handleFiles(e.dataTransfer.files);
	};

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		void handleFiles(e.target.files);
	};

	const handleClickUpload = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveImage = (index: number) => {
		const newImages = value.filter((_, i) => i !== index);

		if (value[index].isMain && newImages.length > 0) {
			newImages[0].isMain = true;
		}

		onChange(newImages);
	};

	const handleSetMainImage = (index: number) => {
		const updated = value.map((img, i) => ({
			...img,
			isMain: i === index
		}));
		onChange(updated);
	};

	const getImageSrc = (img: ImageItem): string => {
		return img.type === 'existing' ? img.url : img.preview;
	};

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Imágenes</h2>

			<div className={styles.content}>
				{ value.length === 0 && (

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
							accept="image/*"
							onChange={handleFileInput}
							className={styles.fileInput}
							data-testid="file-input"
						/>
					</div>
					)
				}

				{value.length > 0 && (
					<div className={styles.gallery}>
						{value.map((img, index) => (
							<div key={index} className={styles.imageCard}>
								<div className={styles.imageWrapper}>
									<img
										src={getImageSrc(img)}
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
									{img.isMain && (
										<span className={styles.mainBadge}>Principal</span>
									)}
								</div>
							</div>
						))}

						<div className={styles.imageCard}>
							<div className={styles.addMoreCard} >
								<svg className={styles.plusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								<p>Agregar más</p>
								<input
									ref={fileInputMoreRef}
									type="file"
									multiple
									accept="image/*"
									onChange={handleFileInput}
									className={styles.fileInput}
									data-testid="file-input-more"
								/>
							</div>
						</div>
					</div>
				)}

				{errors.images && (
					<p className={styles.error}>{errors.images}</p>
				)}

				<p className={styles.hint}>
					{value.length === 0
						? 'Sube al menos una imagen de la propiedad'
						: `${value.length} imagen${value.length > 1 ? 'es' : ''} cargada${value.length > 1 ? 's' : ''}`
					}
				</p>

			</div>
		</section>
	);
}
