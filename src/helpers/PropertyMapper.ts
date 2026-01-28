import { PropertyState, PropertyType } from "@/types/property.types";
import { OperationEnum, PropertyTypeEnum } from "@prisma/client";

export function mapOperationToState(operation: string): PropertyState {
  switch (operation) {
    case 'venta':
      return PropertyState.SALE;
    case 'alquiler':
      return PropertyState.RENT;
    case 'vendida':
      return PropertyState.SOLD;
    case 'alquilada':
      return PropertyState.RENTED;
    default:
      return PropertyState.SALE;
  }
}

export function mapPropertyType(type: string): PropertyType {
  switch (type) {
    case 'casa':
      return PropertyType.HOME;
    case 'departamento':
      return PropertyType.APARTMENT;
    case 'campo':
      return PropertyType.FIELD;
    case 'local_comercial':
      return PropertyType.COMMERCIAL;
    case 'lote':
      return PropertyType.LAND;
    default:
      return PropertyType.HOME; // valor por defecto o error si querés ser estricta
  }
}

// Mapeo para el Estado (Operación)
export const stateMap: Record<OperationEnum, PropertyState> = {
	[OperationEnum.venta]: PropertyState.SALE,
	[OperationEnum.alquiler]: PropertyState.RENT,
	[OperationEnum.vendida]: PropertyState.SOLD,
	[OperationEnum.alquilada]: PropertyState.RENTED,
};

// Mapeo para el Tipo de Propiedad
export const typeMap: Record<PropertyTypeEnum, PropertyType> = {
	[PropertyTypeEnum.casa]: PropertyType.HOME,
	[PropertyTypeEnum.departamento]: PropertyType.APARTMENT,
	[PropertyTypeEnum.campo]: PropertyType.FIELD,
	[PropertyTypeEnum.local_comercial]: PropertyType.COMMERCIAL,
	[PropertyTypeEnum.lote]: PropertyType.LAND,
};