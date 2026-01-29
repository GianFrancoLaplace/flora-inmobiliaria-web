import styles from './DescriptionSection.module.css';

export default function DescriptionSection() {
	const characterCount = 0;
	const maxCharacters = 2000;

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Descripción y Amenities</h2>

			<div className={styles.content}>
				{/* Descripción principal */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="description">
						Descripción de la propiedad <span className={styles.required}>*</span>
					</label>
					<textarea
						id="description"
						rows={8}
						placeholder="Describe las características principales de la propiedad, sus ambientes, estado, ubicación y puntos destacados..."
						className={styles.textarea}
					/>
					<div className={styles.textareaFooter}>
						<p className={styles.hint}>
							Sé detallado pero conciso. Destaca lo que hace única a esta propiedad.
						</p>
						<span className={styles.charCounter}>
              {characterCount} / {maxCharacters}
            </span>
					</div>
				</div>

				{/* Amenities */}
				<div className={styles.formGroup}>
					<label className={styles.label}>Amenities del edificio</label>
					<div className={styles.amenitiesGrid}>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Pileta</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Gimnasio</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>SUM</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Seguridad 24hs</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Ascensor</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Parrilla</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Lavadero</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Terraza</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Quincho</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Área de juegos</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Estacionamiento visitas</span>
						</label>
						<label className={styles.amenityLabel}>
							<input
								type="checkbox"
								className={styles.checkbox}
							/>
							<span>Portero eléctrico</span>
						</label>
					</div>
				</div>

				{/* Estado de publicación */}
				<div className={styles.statusGroup}>
					<div className={styles.formGroup}>
						<label className={styles.label}>Estado de publicación</label>
						<div className={styles.radioGroup}>
							<label className={styles.radioLabel}>
								<input
									type="radio"
									name="status"
									value="draft"
									className={styles.radio}
									defaultChecked
								/>
								<div className={styles.radioContent}>
									<span className={styles.radioTitle}>Borrador</span>
									<span className={styles.radioDesc}>No visible al público</span>
								</div>
							</label>
							<label className={styles.radioLabel}>
								<input
									type="radio"
									name="status"
									value="published"
									className={styles.radio}
								/>
								<div className={styles.radioContent}>
									<span className={styles.radioTitle}>Publicada</span>
									<span className={styles.radioDesc}>Visible en el sitio</span>
								</div>
							</label>
							<label className={styles.radioLabel}>
								<input
									type="radio"
									name="status"
									value="paused"
									className={styles.radio}
								/>
								<div className={styles.radioContent}>
									<span className={styles.radioTitle}>Pausada</span>
									<span className={styles.radioDesc}>Oculta temporalmente</span>
								</div>
							</label>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}