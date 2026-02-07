export interface ExistingImage {
	type: 'existing';
	id: number;
	url: string;
	position: number;
	isMain: boolean;
}

export interface NewImage {
	type: 'new';
	file: File;
	preview: string;
	position: number;
	isMain: boolean;
}

export interface ImageMetadata {
	position: number;
	isMain: boolean;
}


export type ImageItem = ExistingImage | NewImage;