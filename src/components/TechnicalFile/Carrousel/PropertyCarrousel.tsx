'use client';

import Image from 'next/image';
import { useState } from 'react';
import styles from './CarrouselFotos.module.css';
import type { ImageDbModel } from '@/types/prisma';

type PropertyCarouselProps = {
	images: ImageDbModel[];
};

export default function PropertyCarousel({ images }: PropertyCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const hasImages = images.length > 0;

	const next = () => {
		if (hasImages) {
			setCurrentIndex((prev) => (prev + 1) % images.length);
		}
	};

	const prev = () => {
		if (hasImages) {
			setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
		}
	};

	if (!hasImages) {
		return (
			<div className={styles.imageContainerProperties}>
				<Image
					src="/backgrounds/homeBackground.jpg"
					alt="Imagen por defecto"
					fill
					style={{ objectFit: 'cover' }}
					className={styles.imageProperties}
				/>
			</div>
		);
	}

	return (
		<div className={styles.imageContainerProperties}>
			<Image
				key={images[currentIndex].idImage}
				src={images[currentIndex].url || '/placeholder-image.jpg'}
				alt={images[currentIndex].alt_text || 'Imagen de propiedad'}
				fill
				style={{ objectFit: 'cover' }}
				className={styles.imageProperties}
			/>

			{images.length > 1 && (
				<div className={styles.buttonProperties}>
					<button onClick={prev} aria-label="Imagen anterior">
						<Image
							src="/icons/IconFlechaDireccionContraria.png"
							alt="Flecha izquierda"
							width={30}
							height={30}
						/>
					</button>
					<button onClick={next} aria-label="Siguiente imagen">
						<Image
							src="/icons/IconFlecha.png"
							alt="Flecha derecha"
							width={30}
							height={30}
						/>
					</button>
				</div>
			)}
		</div>
	);
}