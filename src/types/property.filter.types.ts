import {CurrencyEnum, OperationEnum, PropertyTypeEnum} from "@/types/prisma";

export interface PropertyFilters {
	types?: PropertyTypeEnum[];
	operations?: OperationEnum[];
	minPrice?: number;
	maxPrice?: number;
	currency?: CurrencyEnum;
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
	currency?: CurrencyEnum;
}
