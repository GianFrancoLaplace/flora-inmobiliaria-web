import PropertyForm from "@/components/PropertyForm/PropertyForm";
import {PropertyService} from "@/services/property.service";
import {CreatePropertyDTO, ImageMetadata} from "@/types/property.types";

const handleCreate = async  (
	                          dto: CreatePropertyDTO,
                              files: File[],
                              imageMetadata: ImageMetadata[] ) => {
	const propertyService = new PropertyService();
	await propertyService.create(dto, files, imageMetadata);
}

export default async function FormPage(){
	return (
		<PropertyForm mode={"create"} onSubmit={handleCreate} >

		</PropertyForm>
	)
}