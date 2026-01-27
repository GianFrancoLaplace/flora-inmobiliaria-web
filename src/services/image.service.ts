import cloudinary from "@/lib/cloudinary";
import {Image, ImageMetadata} from "@/types/property.types";
import {prisma } from "@/lib/prisma";

export class ImageService {
	async create(file: File, imageMetadata: ImageMetadata): Promise<Image> {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader.upload_stream(
				{ folder: 'flora' }, // Organiza tus imágenes
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			).end(buffer);
		});

		const image = prisma.image.create({
			data: {
				idProperty: imageMetadata.idProperty,
				url: imageMetadata.url,
				alt_text: imageMetadata.altText
			},
		})

		return image;
	}
}