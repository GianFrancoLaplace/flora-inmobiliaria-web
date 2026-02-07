import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface UseGoogleMapsProps {
	center?: { lat: number; lng: number };
	zoom?: number;
}

interface MapLocation {
	lat: number;
	lng: number;
	address: string;
	city?: string;
	neighborhood?: string;
}

export function useGoogleMaps({
	                              center = { lat: -37.3217, lng: -59.1332 }, // Tandil por default
	                              zoom = 13
                              }: UseGoogleMapsProps = {}) {

	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [marker, setMarker] = useState<google.maps.Marker | null>(null);
	const [location, setLocation] = useState<MapLocation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Inicializar Google Maps
	useEffect(() => {
		const loader = new Loader({
			apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
			version: 'weekly',
			libraries: ['places', 'geocoding'] // Places para autocomplete, geocoding para lat/lng
		});

		loader
			.load()
			.then(() => {
				if (!mapRef.current) return;

				// Crear el mapa
				const googleMap = new google.maps.Map(mapRef.current, {
					center,
					zoom,
					mapTypeControl: true,
					streetViewControl: false,
					fullscreenControl: false,
				});

				setMap(googleMap);

				// Crear marker inicial
				const newMarker = new google.maps.Marker({
					map: googleMap,
					draggable: true, // KEY: El usuario puede arrastrar el marker
					animation: google.maps.Animation.DROP,
				});

				setMarker(newMarker);
				setIsLoading(false);
			})
			.catch((err) => {
				console.error('Error loading Google Maps:', err);
				setError('No se pudo cargar Google Maps');
				setIsLoading(false);
			});
	}, []);

	// Función para actualizar ubicación desde coordenadas
	const updateLocationFromCoordinates = async (lat: number, lng: number) => {
		if (!marker || !map) return;

		// Mover marker
		const position = { lat, lng };
		marker.setPosition(position);
		map.panTo(position);

		// Reverse geocoding: Convertir lat/lng a dirección legible
		const geocoder = new google.maps.Geocoder();

		try {
			const response = await geocoder.geocode({ location: position });

			if (response.results[0]) {
				const result = response.results[0];

				// Extraer componentes de la dirección
				const addressComponents = result.address_components;
				const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
				const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
				const city = addressComponents.find(c => c.types.includes('locality'))?.long_name;
				const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name;

				const fullAddress = `${route} ${streetNumber}`.trim();

				setLocation({
					lat,
					lng,
					address: fullAddress || result.formatted_address,
					city,
					neighborhood,
				});
			}
		} catch (error) {
			console.error('Geocoding error:', error);
			setError('Error al obtener la dirección');
		}
	};

	// Función para buscar dirección y centrar mapa
	const searchAddress = async (address: string) => {
		if (!map || !address.trim()) return;

		const geocoder = new google.maps.Geocoder();

		try {
			const response = await geocoder.geocode({ address });

			if (response.results[0]) {
				const location = response.results[0].geometry.location;
				await updateLocationFromCoordinates(location.lat(), location.lng());
			} else {
				setError('No se encontró la dirección');
			}
		} catch (error) {
			console.error('Geocoding error:', error);
			setError('Error al buscar la dirección');
		}
	};

	// Listener para cuando el usuario arrastra el marker
	useEffect(() => {
		if (!marker) return;

		const dragListener = marker.addListener('dragend', () => {
			const position = marker.getPosition();
			if (position) {
				updateLocationFromCoordinates(position.lat(), position.lng());
			}
		});

		return () => {
			google.maps.event.removeListener(dragListener);
		};
	}, [marker]);

	return {
		mapRef,
		map,
		marker,
		location,
		isLoading,
		error,
		searchAddress,
		updateLocationFromCoordinates,
	};
}