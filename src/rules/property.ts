import { z } from "zod";
import { PropertyState, PropertyType } from "@/types/property.types";
import { OperationEnum } from "@prisma/client";

const optionalNonEmptyString = (field: string, min = 2, max = 120) =>
    z
        .string({ invalid_type_error: `${field} debe ser texto` })
        .trim()
        .min(min, `${field} es requerido`)
        .max(max, `${field} es demasiado largo`)
        .optional();

const optionalInt = (field: string, min: number, max: number) =>
    z
        .number({ invalid_type_error: `${field} debe ser número` })
        .int(`${field} debe ser entero`)
        .min(min, `${field} debe ser >= ${min}`)
        .max(max, `${field} debe ser <= ${max}`)
        .optional();

const optionalPositive = (field: string, min: number, max: number) =>
    z
        .number({ invalid_type_error: `${field} debe ser número` })
        .min(min, `${field} debe ser >= ${min}`)
        .max(max, `${field} debe ser <= ${max}`)
        .optional();

const ubicationSchema = z
    .string({ invalid_type_error: "Ubicación debe ser texto" })
    .trim()
    .min(5, "Ubicación inválida")
    .max(500, "Ubicación demasiado larga")
    .optional();

export const propertyUpdateSchema = z
    .object({
        address: optionalNonEmptyString("Dirección", 4, 140),
        city: optionalNonEmptyString("Ciudad", 2, 80),
        state: z.nativeEnum(PropertyState).optional(),

        // ✅ ahora es string
        ubication: ubicationSchema,

        price: z
            .number({ invalid_type_error: "Precio debe ser número" })
            .positive("Precio debe ser mayor a 0")
            .max(1_000_000_000, "Precio demasiado alto")
            .optional(),

        description: z
            .string({ invalid_type_error: "Descripción debe ser texto" })
            .trim()
            .min(10, "Descripción muy corta")
            .max(5000, "Descripción demasiado larga")
            .optional(),

        type: z.nativeEnum(PropertyType).optional(),

        category: z.nativeEnum(OperationEnum).optional(),

        surface: optionalPositive("Superficie", 10, 1_000_000),
        bedrooms: optionalInt("Dormitorios", 0, 30),
        bathrooms: optionalInt("Baños", 0, 30),
        garage: optionalInt("Cocheras", 0, 20),
        floors: optionalInt("Pisos", 0, 200),

        constructed_area: optionalPositive("Área construida", 5, 1_000_000),
    })
    .superRefine((data, ctx) => {
        if (
            typeof data.surface === "number" &&
            typeof data.constructed_area === "number" &&
            data.constructed_area > data.surface
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["constructed_area"],
                message: "Área construida no puede ser mayor que la superficie",
            });
        }

        if (data.type === PropertyType.LAND || data.type === PropertyType.FIELD) {
            const invalid =
                (typeof data.bedrooms === "number" && data.bedrooms > 0) ||
                (typeof data.bathrooms === "number" && data.bathrooms > 0);

            if (invalid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["type"],
                    message:
                        "Para lote/campo, dormitorios y baños deberían ser 0 o no enviarse",
                });
            }
        }
    });

export type PropertyUpdateDataValidated = z.infer<typeof propertyUpdateSchema>;
