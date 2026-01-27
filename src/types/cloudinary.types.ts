export interface CloudinaryResult {
	url: string;          // secure_url de Cloudinary
	publicId: string;     // public_id único
	width: number;        // dimensiones para responsive
	height: number;
	format: string;       // jpg, png, webp, etc.
	bytes: number;        // tamaño en bytes
	createdAt: string;    // timestamp ISO
}
