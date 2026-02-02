import {PropertyState, PropertyType} from "@/types/property.types";
import {OperationEnum, PropertyTypeEnum} from "@prisma/client";

export interface PropertyFilters {
	types?: PropertyType[];
	operations?: PropertyState[];
	minPrice?: number;
	maxPrice?: number;
}

export interface WhereClause {
	type?: {
		in: PropertyTypeEnum[];
	};
	category?: {
		in: OperationEnum[];
	};
	price?: {
		gte?: number;
		lte?: number;
	};
}