import styles from './MediaSection.module.css';

interface MediaSectionProps {
	mode: 'create' | 'edit';
}

export default function MediaSection({ mode }: MediaSectionProps) {
	const hasImages = mode === 'edit'; // Simulación para mostrar ambos estados

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Multimedia</h2>

			<div className={styles.content}>
				{/* Zona de carga */}
				<div className={styles.uploadArea}>
					<div className={styles.dropzone}>
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
							<input
								type="file"
								multiple
								accept="image/*"
								className={styles.fileInput}
							/>
						</div>
					</div>
				</div>

				{/* Galería de imágenes (modo edición) */}
				{hasImages && (
					<div className={styles.gallery}>
						<div className={styles.imageCard}>
							<div className={styles.imageWrapper}>
								<img
									src="/placeholder-property.jpg"
									alt="Propiedad"
									className={styles.image}
								/>
								<div className={styles.imageOverlay}>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
								<span className={styles.mainBadge}>Principal</span>
							</div>
						</div>

						<div className={styles.imageCard}>
							<div className={styles.imageWrapper}>
								<img
									src="/placeholder-property.jpg"
									alt="Propiedad"
									className={styles.image}
								/>
								<div className={styles.imageOverlay}>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						<div className={styles.imageCard}>
							<div className={styles.imageWrapper}>
								<img
									src="/placeholder-property.jpg"
									alt="Propiedad"
									className={styles.image}
								/>
								<div className={styles.imageOverlay}>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
									<button type="button" className={styles.imageBtn}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>

						{/* Placeholder para agregar más */}
						<div className={styles.imageCard}>
							<div className={styles.addMoreCard}>
								<svg className={styles.plusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								<p>Agregar más</p>
							</div>
						</div>
					</div>
				)}

				{/* Video/Tour virtual */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="videoUrl">
						Video o Tour Virtual (URL)
					</label>
					<input
						id="videoUrl"
						type="url"
						placeholder="https://youtube.com/watch?v=..."
						className={styles.input}
					/>
					<p className={styles.hint}>
						YouTube, Vimeo o Matterport
					</p>
				</div>
			</div>
		</section>
	);
}