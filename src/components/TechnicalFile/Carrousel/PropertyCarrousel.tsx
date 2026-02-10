"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CarrouselFotos.module.css";
import type { ImageDbModel } from "@/types/prisma";

type PropertyCarouselProps = {
	images: ImageDbModel[];
};

export default function PropertyCarousel({ images }: PropertyCarouselProps) {
	const normalized = useMemo(
		() => (images ?? []).filter((img) => (img.url ?? "").trim().length > 0),
		[images]
	);

	const hasImages = normalized.length > 0;
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loaded, setLoaded] = useState(false);

	const startX = useRef<number | null>(null);

	useEffect(() => setLoaded(false), [currentIndex]);

	const next = () => hasImages && setCurrentIndex((p) => (p + 1) % normalized.length);
	const prev = () => hasImages && setCurrentIndex((p) => (p - 1 + normalized.length) % normalized.length);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (!hasImages) return;
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasImages, normalized.length]);

	const src = hasImages
		? normalized[currentIndex].url!.trim()
		: "/backgrounds/homeBackground.jpg";

	const alt = hasImages
		? normalized[currentIndex].alt_text || "Imagen de propiedad"
		: "Imagen por defecto";

	return (
		<div
			className={styles.carousel}
			role="region"
			aria-label="Galería de imágenes de la propiedad"
			onPointerDown={(e) => (startX.current = e.clientX)}
			onPointerUp={(e) => {
				if (startX.current === null) return;
				const dx = e.clientX - startX.current;
				startX.current = null;
				if (Math.abs(dx) < 40) return;
				dx > 0 ? prev() : next();
			}}
		>
			<div className={styles.frame}>
				<div className={`${styles.skeleton} ${loaded ? styles.skeletonHidden : ""}`} />
				<Image
					key={hasImages ? normalized[currentIndex].idImage : "default"}
					src={src}
					alt={alt}
					fill
					priority
					sizes="(max-width: 768px) 100vw, 1120px"
					className={`${styles.image} ${loaded ? styles.imageActive : ""}`}
					onLoadingComplete={() => setLoaded(true)}
				/>
				<div className={styles.overlay} aria-hidden />
			</div>

			{hasImages && normalized.length > 1 && (
				<>
					<div className={styles.controls}>
						<button type="button" onClick={prev} aria-label="Imagen anterior" className={styles.navBtn}>
							<Image src="/icons/IconFlechaDireccionContraria.png" alt="" width={22} height={22} aria-hidden />
						</button>
						<button type="button" onClick={next} aria-label="Siguiente imagen" className={styles.navBtn}>
							<Image src="/icons/IconFlecha.png" alt="" width={22} height={22} aria-hidden />
						</button>
					</div>

					<div className={styles.dots} aria-label="Indicadores de imágenes">
						{normalized.map((img, idx) => (
							<button
								key={img.idImage}
								type="button"
								className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ""}`}
								onClick={() => setCurrentIndex(idx)}
								aria-label={`Ir a imagen ${idx + 1}`}
								aria-current={idx === currentIndex ? "true" : "false"}
							/>
						))}
					</div>

					<div className={styles.counter} aria-label="Contador de imágenes">
						{currentIndex + 1} / {normalized.length}
					</div>
				</>
			)}
		</div>
	);
}
