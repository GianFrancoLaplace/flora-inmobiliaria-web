import PropertyForm from "@/components/PropertyForm/PropertyForm";
import {PropertyService} from "@/services/property.service";
import {FormMode, PropertyFormInput} from "@/types/property-form.types";
import {parsePropertyFormToService} from "@/lib/property-form-parser";

export default function FormPage() {
	const handleCreate = async (formInput: PropertyFormInput) => {
		const { dto, files, imageMetadata } = parsePropertyFormToService(formInput);

		const propertyService = new PropertyService();
		await propertyService.create(dto, files, imageMetadata);
	};

	return (
		<PropertyForm mode={FormMode.CREATE} onSubmit={handleCreate} />
	);
}