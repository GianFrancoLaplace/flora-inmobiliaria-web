import styles from './LocalSection.module.css';

export default function LocationSection() {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Ubicación</h2>

			<div className={styles.content}>
				<div className={styles.grid}>
					{/* Dirección */}
					<div className={`${styles.formGroup} ${styles.fullWidth}`}>
						<label className={styles.label} htmlFor="address">
							Dirección <span className={styles.required}>*</span>
						</label>
						<input
							id="address"
							type="text"
							placeholder="Ej: Av. San Martín 1234"
							className={styles.input}
						/>
						<p className={styles.hint}>
							Comienza a escribir para autocompletar
						</p>
					</div>

					{/* Ciudad */}
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="city">
							Ciudad <span className={styles.required}>*</span>
						</label>
						<input
							id="city"
							type="text"
							placeholder="Ej: Tandil"
							className={styles.input}
						/>
					</div>

					{/* Provincia */}
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="province">
							Provincia <span className={styles.required}>*</span>
						</label>
						<select
							id="province"
							className={styles.select}
							defaultValue=""
						>
							<option value="" disabled>Seleccionar provincia</option>
							<option value="buenos-aires">Buenos Aires</option>
							<option value="cordoba">Córdoba</option>
							<option value="santa-fe">Santa Fe</option>
							<option value="mendoza">Mendoza</option>
							<option value="tucuman">Tucumán</option>
						</select>
					</div>

					{/* Código Postal */}
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="zipCode">
							Código Postal
						</label>
						<input
							id="zipCode"
							type="text"
							placeholder="7000"
							className={styles.input}
						/>
					</div>

					{/* Barrio/Zona */}
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="neighborhood">
							Barrio/Zona
						</label>
						<input
							id="neighborhood"
							type="text"
							placeholder="Ej: Centro"
							className={styles.input}
						/>
					</div>
				</div>

				{/* Mapa */}
				<div className={styles.mapContainer}>
					<div className={styles.mapPlaceholder}>
						<svg className={styles.mapIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<p className={styles.mapText}>El mapa se mostrará aquí</p>
						<p className={styles.mapHint}>
							Arrastra el marcador para ajustar la ubicación exacta
						</p>
					</div>
				</div>

				{/* Coordenadas (ocultas para usuario, útiles para debug) */}
				<div className={styles.coordinatesGroup}>
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="latitude">
							Latitud
						</label>
						<input
							id="latitude"
							type="text"
							placeholder="-37.3217"
							className={styles.inputReadonly}
							readOnly
						/>
					</div>
					<div className={styles.formGroup}>
						<label className={styles.label} htmlFor="longitude">
							Longitud
						</label>
						<input
							id="longitude"
							type="text"
							placeholder="-59.1332"
							className={styles.inputReadonly}
							readOnly
						/>
					</div>
				</div>
			</div>
		</section>
	);
}