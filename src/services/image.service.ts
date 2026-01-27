import cloudinary from "@/lib/cloudinary";
import {Image, ImageMetadata} from "@/types/property.types";
import {prisma } from "@/lib/prisma";
import {CloudinaryResult} from "@/types/cloudinary.types";


export class ImageService {

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
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		return new Promise((resolve, reject) => {
			cloudinary.uploader.upload_stream(
				{
					folder: 'propiedades',
					public_id: `property_${propertyId}_${position}_${Date.now()}`,
					resource_type: 'image'
				},
				(error, result) => {
					if (error) {
						console.error(`Cloudinary upload failed for position ${position}:`, error);
						return reject(error);
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