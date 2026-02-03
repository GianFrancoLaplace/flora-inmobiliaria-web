'use client';

import { useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import styles from './LocalSection.module.css';
import { PropertyFormInput } from "@/types/property-form.types";

// Configuración del mapa
const mapContainerStyle = {
	width: '100%',
	height: '400px',
};

const defaultCenter = {
	lat: -37.3217, // Tandil
	lng: -59.1332,
};

const libraries: ('places')[] = ['places']; // Debe estar FUERA del component

interface LocationSectionProps {
	formData: PropertyFormInput;
	onChange: (field: string, value: any) => void;
	errors: Record<string, string>;
}

// Subcomponent para el Autocomplete (separado para clarity)
function PlacesAutocomplete({
	                            onSelect
                            }: {
	onSelect: (lat: number, lng: number, address: string, city?: string, neighborhood?: string) => void
}) {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			componentRestrictions: { country: 'ar' }, // Restringir a Argentina
		},
		debounce: 300, // Built-in debounce para reducir API calls
	});

	const handleSelect = async (description: string) => {
		setValue(description, false);
		clearSuggestions();

		try {
			const results = await getGeocode({ address: description });
			const { lat, lng } = await getLatLng(results[0]);

			// Extraer componentes de dirección
			const addressComponents = results[0].address_components;
			const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
			const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name;

			onSelect(lat, lng, description, city, neighborhood);
		} catch (error) {
			console.error('Error getting geocode:', error);
		}
	};

	return (
		<div className={styles.autocompleteContainer}>
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				disabled={!ready}
				placeholder="Buscar dirección (ej: Av. San Martín 1234, Tandil)"
				className={styles.input}
			/>

			{status === 'OK' && (
				<ul className={styles.suggestionsList}>
					{data.map((suggestion) => (
						<li
							key={suggestion.place_id}
							onClick={() => handleSelect(suggestion.description)}
							className={styles.suggestionItem}
						>
							{suggestion.description}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default function LocationSection({ formData, onChange, errors }: LocationSectionProps) {
	const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
	const [mapCenter, setMapCenter] = useState(defaultCenter);

	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries,
	});

	const handlePlaceSelect = (
		lat: number,
		lng: number,
		address: string,
		city?: string,
		neighborhood?: string
	) => {
		const position = { lat, lng };
		setMarkerPosition(position);
		setMapCenter(position);

		// Actualizar formulario
		onChange('address', address);
		onChange('city', city || '');
		onChange('ubication', neighborhood || '');
		onChange('latitude', lat);
		onChange('longitude', lng);
	};

	const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
		if (!e.latLng) return;

		const lat = e.latLng.lat();
		const lng = e.latLng.lng();

		setMarkerPosition({ lat, lng });

		// Reverse geocoding para obtener dirección
		try {
			const results = await getGeocode({ location: { lat, lng } });
			const address = results[0].formatted_address;
			const addressComponents = results[0].address_components;
			const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
			const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name;

			onChange('address', address);
			onChange('city', city || '');
			onChange('ubication', neighborhood || '');
			onChange('latitude', lat);
			onChange('longitude', lng);
		} catch (error) {
			console.error('Error reverse geocoding:', error);
		}
	};

	if (loadError) return <div>Error loading maps</div>;
	if (!isLoaded) return <div>Loading maps...</div>;

	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>Ubicación</h2>

			<div className={styles.grid}>

				{/* Autocomplete Search */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label}>
						Buscar ubicación en el mapa
					</label>
					<PlacesAutocomplete onSelect={handlePlaceSelect} />
					<p className={styles.hint}>
						Busca la dirección y ajusta arrastrando el marcador si es necesario
					</p>
				</div>

				{/* Mapa */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<GoogleMap
						mapContainerStyle={mapContainerStyle}
						center={mapCenter}
						zoom={15}
						options={{
							streetViewControl: false,
							mapTypeControl: false,
						}}
					>
						{markerPosition && (
							<MarkerF
								position={markerPosition}
								draggable={true}
								onDragEnd={handleMarkerDragEnd}
							/>
						)}
					</GoogleMap>
				</div>

				{/* Campos de texto (ahora son read-only mayormente) */}
				<div className={`${styles.formGroup} ${styles.fullWidth}`}>
					<label className={styles.label} htmlFor="address">
						Dirección <span className={styles.required}>*</span>
					</label>
					<input
						id="address"
						type="text"
						value={formData.address || ''}
						onChange={(e) => onChange('address', e.target.value)}
						className={errors.address ? styles.inputError : styles.input}
					/>
					{errors.address && (
						<p className={styles.error}>{errors.address}</p>
					)}
				</div>

				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="city">
						Ciudad
					</label>
					<input
						id="city"
						type="text"
						value={formData.city || ''}
						onChange={(e) => onChange('city', e.target.value)}
						className={styles.input}
					/>
				</div>

				<div className={styles.formGroup}>
					<label className={styles.label} htmlFor="ubication">
						Barrio/Zona
					</label>
					<input
						id="ubication"
						type="text"
						value={formData.ubication || ''}
						onChange={(e) => onChange('ubication', e.target.value)}
						className={styles.input}
					/>
				</div>

			</div>
		</section>
	);
}