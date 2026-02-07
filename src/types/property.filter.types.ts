import {OperationEnum, PropertyTypeEnum} from "@prisma/client";

export interface PropertyFilters {
	types?: PropertyTypeEnum[];
	operations?: OperationEnum[];
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