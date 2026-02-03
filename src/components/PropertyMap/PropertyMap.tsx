interface PropertyMapProps {
	address: string;
	city?: string;
	ubication?: string;
	height?: string;
}

export default function PropertyMap({
	                                    address,
	                                    city,
	                                    ubication,
	                                    height = '400px'
                                    }: PropertyMapProps) {

	// Construir dirección completa
	const fullAddress = [address, ubication, city]
		.filter(Boolean)
		.join(', ');

	const encodedAddress = encodeURIComponent(fullAddress);
	const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

	return (
		<div style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden' }}>
			<iframe
				src={mapUrl}
				width="100%"
				height="100%"
				style={{ border: 0 }}
				allowFullScreen
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
			/>
		</div>
	);
}