import cloudinary from "@/lib/cloudinary";
import {ImageMetadata} from "@/types/image.types";

import {CloudinaryResult} from "@/types/cloudinary.types";

const SUPPORTED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/heic',
	'image/heif',
]);

const SUPPORTED_EXTENSIONS = new Set([
	'jpg',
	'jpeg',
	'png',
	'webp',
	'heic',
	'heif',
]);

const FORMAT_ERROR_PREFIX = 'IMAGE_FORMAT_ERROR:';

export class ImageService {
	private getFileExtension(fileName: string): string {
		const extension = fileName.split('.').pop();
		return extension ? extension.toLowerCase() : '';
	}

	private isSupportedImage(file: File): boolean {
		const extension = this.getFileExtension(file.name);
		const byMime = SUPPORTED_MIME_TYPES.has((file.type || '').toLowerCase());
		const byExtension = SUPPORTED_EXTENSIONS.has(extension);
		return byMime || byExtension;
	}

	private isHeicLike(file: File): boolean {
		const extension = this.getFileExtension(file.name);
		const mimeType = (file.type || '').toLowerCase();
		return extension === 'heic' || extension === 'heif' || mimeType === 'image/heic' || mimeType === 'image/heif';
	}

	async uploadMultiple(
		files: File[],
		propertyId: number,
		metadata: ImageMetadata[]
	): Promise<CloudinaryResult[]> {

		// Subir TODAS en paralelo con Promise.all
		const uploadPromises = files.map((file, index) =>
			this.uploadSingle(file, propertyId, metadata[index].position)
		);

		return await Promise.all(uploadPromises);
	}

	async uploadSingle(
		file: File,
		propertyId: number,
		position: number
	): Promise<CloudinaryResult> {
		if (!this.isSupportedImage(file)) {
			throw new Error(`${FORMAT_ERROR_PREFIX} Formato no soportado (${file.type || 'desconocido'}) para ${file.name}`);
		}

		const forceJpgOutput = this.isHeicLike(file);
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		return new Promise((resolve, reject) => {
			cloudinary.uploader.upload_stream(
				{
					folder: 'propiedades',
					public_id: `property_${propertyId}_${position}_${Date.now()}`,
					resource_type: 'image',
					allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
					format: forceJpgOutput ? 'jpg' : undefined,
				},
				(error, result) => {
					if (error) {
						console.error(`Cloudinary upload failed for position ${position}:`, error);
						return reject(new Error(`${FORMAT_ERROR_PREFIX} No se pudo procesar ${file.name}. Verifica formato y tamaño.`));
					}

					if (!result) {
						return reject(new Error('Cloudinary returned undefined result - WTF?'));
					}

					// Mapear la response de Cloudinary a nuestro type limpio
					resolve({
						url: result.secure_url,
						publicId: result.public_id,
						width: result.width,
						height: result.height,
						format: result.format,
						bytes: result.bytes,
						createdAt: result.created_at
					});
				}
			).end(buffer);
		});
	}

	async deleteMultiple(publicIds: string[]): Promise<void> {
		try {
			// Delete en paralelo porque time is money
			await Promise.all(
				publicIds.map(publicId =>
					cloudinary.uploader.destroy(publicId)
				)
			);
		} catch (error) {
			// Log pero no throw - el rollback es best-effort
			console.error('Failed to cleanup Cloudinary images:', error);
			// En producción, esto debería ir a un dead-letter queue para retry
		}
	}
}
