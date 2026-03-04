import { describe, it, expect } from "vitest";
import { createPropertySchema } from "./property.schema";
import { PropertyTypeEnum } from "@prisma/client";
import { OperationEnum } from "@/types/prisma";

describe("Property Schema - Validación de Reglas de Negocio", () => {

	// Datos base válidos para una casa
	const validHouseData = {
		type: PropertyTypeEnum.casa,
		category: OperationEnum.venta,
		price: 150000,
		currency: "USD" as const,
		surface: 500,
		constructedArea: 150,
		address: "Calle de las catedrales 123",
		city: "Tandil",
		ubication: "Centro",
		description: "Una propiedad construida con estándares de alta ingeniería.",
		bedrooms: 3,
		bathrooms: 2,
	};

	it("debe validar exitosamente una casa con todos sus campos requeridos", () => {
		const result = createPropertySchema.safeParse(validHouseData);
		expect(result.success).toBe(true);
	});

	describe("Validaciones Condicionales (superRefine)", () => {

		it("debe fallar si una CASA no tiene dormitorios (bedrooms)", () => {
			const invalidHouse = { ...validHouseData, bedrooms: undefined };
			const result = createPropertySchema.safeParse(invalidHouse);

			expect(result.success).toBe(false);
			if (!result.success) {
				const errors = result.error.flatten().fieldErrors;
				expect(errors.bedrooms?.[0]).toContain("dormitorios");
			}
		});

		it("debe fallar si el área construida es mayor a la superficie total del lote", () => {
			const impossibleHouse = {
				...validHouseData,
				surface: 100,
				constructedArea: 150
			};
			const result = createPropertySchema.safeParse(impossibleHouse);

			expect(result.success).toBe(false);
			if (!result.success) {
				const errors = result.error.flatten().fieldErrors;
				expect(errors.constructedArea?.[0]).toContain("construida");
			}
		});

		it("debe validar un LOTE sin requerir dormitorios ni baños", () => {
			const validLand = {
				type: PropertyTypeEnum.lote,
				category: OperationEnum.venta,
				price: 50000,
				currency: "USD" as const,
				surface: 1000,
				address: "Ruta 226 Km 5",
				description: "Terreno baldío listo para construir catedrales de software.",
			};

			const result = createPropertySchema.safeParse(validLand);
			expect(result.success).toBe(true);
		});
	});

	describe("Validaciones de Campos Base", () => {
		it("debe fallar si la descripción es demasiado corta (< 10 caracteres)", () => {
			const data = { ...validHouseData, description: "Corta" };
			const result = createPropertySchema.safeParse(data);

			expect(result.success).toBe(false);
			expect(result.error?.flatten().fieldErrors.description).toBeDefined();
		});

		it("debe fallar si el precio es negativo o cero", () => {
			const data = { ...validHouseData, price: -500 };
			const result = createPropertySchema.safeParse(data);

			expect(result.success).toBe(false);
			expect(result.error?.flatten().fieldErrors.price?.[0]).toBe("El precio debe ser mayor a 0");
		});
	});
});
