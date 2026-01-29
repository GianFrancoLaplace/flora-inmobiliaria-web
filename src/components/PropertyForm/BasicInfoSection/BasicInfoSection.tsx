import styles from './BasicInfoSection.module.css';

export default function BasicInfoSection() {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Datos Básicos</h2>

			<div className={styles.grid}>
				{/* Tipo de operación */}
				<div className={styles.formGroup}>
					<label className={styles.label}>
						Operación <span className={styles.required}>*</span>
					</label>
					<div className={styles.radioGroup}>
						<label className={styles.radioLabel}>
							<input
								type="radio"
								name="operationType"
								value="sale"
								className={styles.radio}
								defaultChecked
							/>
							<span>Venta</span>
						</label>
						<label className={styles.radioLabel}>
							<input
								type="radio"
								name="operationType"
								value="rent"
								className={styles.radio}
							/>
							<span>Alquiler</span>
						</label>
					</div>
				</div>

				{/* Tipo de propiedad */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="propertyType">
						Tipo de propiedad <span className={styles.required}>*</span>
					</label>
					<select
						id="propertyType"
						className={styles.select}
						defaultValue="apartment"
					>
						<option value="apartment">Departamento</option>
						<option value="house">Casa</option>
						<option value="land">Terreno</option>
						<option value="commercial">Local comercial</option>
						<option value="office">Oficina</option>
					</select>
				</div>

				{/* Título */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="title">
						Título de la propiedad <span className={styles.required}>*</span>
					</label>
					<input
						id="title"
						type="text"
						placeholder="Ej: Hermoso departamento en el centro"
						className={styles.input}
					/>
					<p className={styles.hint}>
						Máximo 100 caracteres. Sé descriptivo pero conciso.
					</p>
				</div>

				{/* Precio */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="price">
						Precio <span className={styles.required}>*</span>
					</label>
					<div className={styles.inputGroup}>
						<select className={styles.selectCurrency} defaultValue="USD">
							<option value="USD">USD</option>
							<option value="ARS">ARS</option>
						</select>
						<input
							id="price"
							type="number"
							placeholder="0"
							className={styles.input}
						/>
					</div>
				</div>

				{/* Expensas */}
				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="expenses">
						Expensas
					</label>
					<input
						id="expenses"
						type="number"
						placeholder="0"
						className={styles.input}
					/>
					<p className={styles.hint}>Opcional</p>
				</div>
			</div>
		</section>
	);
}