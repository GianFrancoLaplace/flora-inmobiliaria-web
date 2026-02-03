import PropertyForm from "@/components/PropertyForm/PropertyForm";
import {FormMode} from "@/types/property-form.types";

export default function FormPage() {
	return (
		<PropertyForm mode={FormMode.CREATE} />
	);
}