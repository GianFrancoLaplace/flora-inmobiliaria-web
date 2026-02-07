// src/components/PropertyForm/LocationSection/LocationSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Info, Loader2 } from 'lucide-react';
import styles from './LocalSection.module.css';
import { PropertyFormInput } from "@/types/property-form.types";

interface LocationSectionProps {
	formData: PropertyFormInput;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

export default function LocationSection({ formData, onChange, errors }: LocationSectionProps) {
	const [mapUrl, setMapUrl] = useState<string>('');
	const [isUpdating, setIsUpdating] = useState(false);
	const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
	const [locationFound, setLocationFound] = useState(true);

	// Geocoding: dirección → coordenadas
	const geocodeAddress = async (address: string, city?: string) => {
		const fullAddress = [address, city]
			.filter(Boolean)
			.join(', ');

		if (!fullAddress.trim()) {
			setMapUrl('');
			setCoordinates(null);
			setLocationFound(true);
			return;
		}

		setIsUpdating(true);
		setLocationFound(true);

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`
			);
			const data = await response.json();

			if (data && data[0]) {
				const lat = parseFloat(data[0].lat);
				const lng = parseFloat(data[0].lon);

				setCoordinates({ lat, lng });
				setLocationFound(true);

				// Guardar coordenadas en el formulario
				onChange('latitude', lat);
				onChange('longitude', lng);
				// Guardar coordenadas en ubication
				onChange('ubication', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);

				// Crear URL con coordenadas (esto SÍ muestra marcador)
				const newUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
				setMapUrl(newUrl);
			} else {
				// Si no encuentra la dirección exacta, intenta solo con ciudad
				if (city) {
					const cityResponse = await fetch(
						`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
					);
					const cityData = await cityResponse.json();

					if (cityData && cityData[0]) {
						const lat = parseFloat(cityData[0].lat);
						const lng = parseFloat(cityData[0].lon);

						setCoordinates({ lat, lng });
						setLocationFound(true);

						onChange('latitude', lat);
						onChange('longitude', lng);
						onChange('ubication', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);

						const newUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
						setMapUrl(newUrl);
					} else {
						setLocationFound(false);
						setCoordinates(null);
					}
				} else {
					setLocationFound(false);
					setCoordinates(null);
				}
			}
		} catch (error) {
			console.error('Error geocoding:', error);
			setLocationFound(false);
			setCoordinates(null);
		} finally {
			setIsUpdating(false);
		}
	};

	// Actualizar mapa cuando cambia la dirección
	useEffect(() => {
		const { address, city } = formData;

		if (!address?.trim()) {
			setMapUrl('');
			setCoordinates(null);
			setLocationFound(true);
			return;
		}

		// Debounce: esperar 1.5 segundos después de que el usuario deja de escribir
		const timeoutId = setTimeout(() => {
			geocodeAddress(address, city);
		}, 1500);

		return () => clearTimeout(timeoutId);
	}, [formData.address, formData.city]);

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Ubicación</h2>

			<div className={styles.grid}>

				{/* Mapa SIEMPRE visible */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<div className={styles.mapContainer}>
						{/* Indicador de actualización */}
						{isUpdating && (
							<div className={styles.mapUpdating}>
								<Loader2 className={styles.spinnerIcon} />
								<span>Buscando ubicación...</span>
							</div>
						)}

						{mapUrl ? (
							<iframe
								src={mapUrl}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								className={isUpdating ? styles.mapFading : ''}
							/>
						) : (
							<div className={styles.mapPlaceholder}>
								<MapPin className={styles.mapIcon} />
								<p className={styles.mapText}>
									Ingresa una dirección para ver la ubicación en el mapa
								</p>
							</div>
						)}
					</div>

					{/* Info de la ubicación */}
					<div className={styles.mapInfo}>
						<div className={styles.mapHint}>
							<Info size={16} />
							<span>La ubicación se actualiza automáticamente mientras escribes</span>
						</div>

						{/* Warning si no encuentra ubicación */}
						{!locationFound && formData.address && !isUpdating && (
							<div className={styles.locationWarning}>
								<AlertCircle size={16} />
								<span>No se encontró esta dirección. Verifica que esté escrita correctamente.</span>
							</div>
						)}

						{/* Mostrar coordenadas cuando existen */}
						{coordinates && (
							<div className={styles.coordsInfo}>
								<MapPin size={16} />
								<span>{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
							</div>
						)}
					</div>
				</div>

				{/* Dirección */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="address">
						Dirección <span className={styles.required}>*</span>
					</label>
					<input
						id="address"
						type="text"
						placeholder="Ej: Av. San Martín 1234"
						value={formData.address || ''}
						onChange={(e) => onChange('address', e.target.value)}
						className={errors.address ? styles.inputError : styles.input}
					/>
					{errors.address && (
						<p className={styles.error}>{errors.address}</p>
					)}
				</div>

				{/* Ciudad */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="city">
						Ciudad
					</label>
					<input
						id="city"
						type="text"
						placeholder="Ej: Tandil"
						value={formData.city || ''}
						onChange={(e) => onChange('city', e.target.value)}
						className={styles.input}
					/>
				</div>

				{/* Coordenadas (hidden input para el form) */}
				<input type="hidden" name="ubication" value={formData.ubication || ''} />

			</div>
		</section>
	);
}