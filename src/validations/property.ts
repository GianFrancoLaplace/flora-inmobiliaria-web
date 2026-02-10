import { z } from "zod";
import { OperationEnum, PropertyTypeEnum, ServiceEnum } from "@/types/prisma";

const serviceEnumSchema = z.nativeEnum(ServiceEnum);

const optionalNonEmptyString = (field: string, min = 2, max = 200) =>
    z
        .string({ invalid_type_error: `${field} debe ser texto` })
        .trim()
        .min(min, `${field} es requerido`)
        .max(max, `${field} es demasiado largo`)
        .optional();

const optionalIntRange = (field: string, min: number, max: number) =>
    z
        .number({ invalid_type_error: `${field} debe ser número` })
        .int(`${field} debe ser entero`)
        .min(min, `${field} debe ser >= ${min}`)
        .max(max, `${field} debe ser <= ${max}`)
        .optional();

export const propertyUpdateSchema = z
    .object({
        address: optionalNonEmptyString("Dirección", 4, 140),

        city: optionalNonEmptyString("Ciudad", 2, 80),


        ubication: z
            .string({ invalid_type_error: "Ubicación debe ser texto" })
            .trim()
            .min(5, "Ubicación inválida")
            .max(500, "Ubicación demasiado larga")
            .optional(),

        description: z
            .string({ invalid_type_error: "Descripción debe ser texto" })
            .trim()
            .min(10, "Descripción muy corta")
            .max(5000, "Descripción demasiado larga")
            .optional(),

        price: z
            .number({ invalid_type_error: "Precio debe ser número" })
            .int("Precio debe ser entero")
            .positive("Precio debe ser mayor a 0")
            .max(1_000_000_000, "Precio demasiado alto")
            .optional(),

        surface: z
            .number({ invalid_type_error: "Superficie debe ser número" })
            .int("Superficie debe ser entera")
            .min(10, "Superficie debe ser >= 10")
            .max(1_000_000, "Superficie demasiado grande")
            .optional(),

        constructedArea: z
            .number({ invalid_type_error: "Área construida debe ser número" })
            .int("Área construida debe ser entera")
            .min(5, "Área construida debe ser >= 5")
            .max(1_000_000, "Área construida demasiado grande")
            .optional(),

        bedrooms: optionalIntRange("Dormitorios", 0, 30),


        bathrooms: optionalIntRange("Baños", 0, 30),

        garage: optionalIntRange("Cocheras", 0, 20),

        floors: optionalIntRange("Pisos", 0, 200),

        type: z.nativeEnum(PropertyTypeEnum).optional(),

        category: z.nativeEnum(OperationEnum).optional(),

	    services: z.array(serviceEnumSchema),
    })
    .superRefine((data, ctx) => {
        if (
            typeof data.surface === "number" &&
            typeof data.constructedArea === "number" &&
            data.constructedArea > data.surface
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["constructedArea"],
                message: "Área construida no puede ser mayor que la superficie",
            });
        }

        if (data.type === PropertyTypeEnum.lote || data.type === PropertyTypeEnum.campo) {
            const invalid =
                (typeof data.bedrooms === "number" && data.bedrooms > 0) ||
                (typeof data.bathrooms === "number" && data.bathrooms > 0);

            if (invalid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["type"],
                    message: "Para lote/campo, dormitorios y baños deberían ser 0 o no enviarse",
                });
            }
        }

      
        if (Object.keys(data).length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [],
                message: "Debes enviar al menos un campo para actualizar",
            });
        }
    });

export type PropertyUpdateDataValidated = z.infer<typeof propertyUpdateSchema>;
