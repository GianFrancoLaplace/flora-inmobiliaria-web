import cloudinary from "@/lib/cloudinary";
import {Image} from "@/types/property.types";

class ImageService {
	async create(file: File) {
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

		return Response.json(result);
	}
}