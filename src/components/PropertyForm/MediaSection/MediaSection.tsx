"use client"

import { useState, DragEvent, ChangeEvent } from 'react';
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
	const PREVIEW_FALLBACK_SRC = '/backgrounds/notImage.jpg';

	const moveToFront = <T,>(items: T[], index: number): T[] => {
		if (index <= 0 || index >= items.length) {
			return items.slice();
		}
		const selected = items[index];
		return [selected, ...items.slice(0, index), ...items.slice(index + 1)];
	};

	const normalizeImages = (images: ImageItem[]): ImageItem[] =>
		images.map((img, idx) => ({ ...img, position: idx }));

	const normalizeMain = (images: ImageItem[], mainIndex: number): ImageItem[] =>
		images.map((img, idx) => ({ ...img, isMain: idx === mainIndex }));

	const canRenderImage = (src: string): Promise<boolean> => {
		return new Promise((resolve) => {
			let settled = false;
			const finish = (value: boolean) => {
				if (settled) return;
				settled = true;
				resolve(value);
			};

			const img = new Image();
			const timeoutId = setTimeout(() => finish(false), 400);

			img.onload = () => {
				clearTimeout(timeoutId);
				finish(true);
			};
			img.onerror = () => {
				clearTimeout(timeoutId);
				finish(false);
			};
			img.src = src;
		});
	};

	const createPreview = async (file: File): Promise<string> => {
		try {
			const objectUrl = URL.createObjectURL(file);
			const renderable = await canRenderImage(objectUrl);
			if (renderable) {
				return objectUrl;
			}
			return PREVIEW_FALLBACK_SRC;
		} catch {
			return await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = async () => {
					const result = reader.result as string;
					if (!result) {
						resolve(PREVIEW_FALLBACK_SRC);
						return;
					}
					const renderable = await canRenderImage(result);
					resolve(renderable ? result : PREVIEW_FALLBACK_SRC);
				};
				reader.onerror = () => resolve(PREVIEW_FALLBACK_SRC);
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

			try {
				const newImage: ImageItem = {
					type: 'new',
					file,
					preview: await createPreview(file),
					position: value.length + newImages.length,
					isMain: value.length === 0 && newImages.length === 0
				};

				newImages.push(newImage);
			} catch {
				alert(`${file.name}: no se pudo preparar la previsualización.`);
			}
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

	const handleRemoveImage = (index: number) => {
		const remaining = value.filter((_, i) => i !== index);

		if (remaining.length === 0) {
			onChange([]);
			return;
		}

		const existingMainIndex = remaining.findIndex((img) => img.isMain);
		const mainIndex = existingMainIndex >= 0 ? existingMainIndex : 0;
		const withMain = normalizeMain(remaining, mainIndex);
		const reordered = moveToFront(withMain, mainIndex);

		onChange(normalizeImages(reordered));
	};

	const handleSetMainImage = (index: number) => {
		const reordered = moveToFront(value, index);
		const updated = normalizeMain(reordered, 0);
		onChange(normalizeImages(updated));
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
						? 'Puedes subir imágenes de la propiedad (opcional)'
						: `${value.length} imagen${value.length > 1 ? 'es' : ''} cargada${value.length > 1 ? 's' : ''}`
					}
				</p>

			</div>
		</section>
	);
}
