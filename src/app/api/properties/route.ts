export const dynamic = "force-dynamic";
export const revalidate = 0;

import {ZodError} from "zod";
import {PropertyService} from "@/services/property.service";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreatePropertyDTO, PropertyTypes, PropertyState } from '@/types/property.types';
import { Characteristic } from "@/types/Characteristic";
import { mapOperationToState, mapPropertyType } from '@/helpers/PropertyMapper';
import { mapPrismaCharacteristicCategory } from '@/helpers/IconMapper';

type PriceFilter = {
    lte?: number;
    gte?: number;
};

const propertyService = new PropertyService();

// export async function GET(request: Request) {
//     try {
//         const { searchParams } = new URL(request.url);
//
//         const types = searchParams.get('tipo')?.split(',') ?? undefined;
//         const operations = searchParams.get('operacion')?.split(',') ?? undefined;
//         const maxValue = searchParams.get('maxValue');
//
//         const service = new PropertyService();
//         const where = await service.buildWhereClause();
//
//         console.log("construida la where clause");
//         if (maxValue && !isNaN(Number(maxValue))) {
//             if (where.price) {
//                 (where.price as PriceFilter).lte = Number(maxValue);
//             } else {
//                 where.price = {
//                     lte: Number(maxValue)
//                 };
//             }
//         }
//         console.log("antes del find many");
//         const propertiesRaw = await prisma.property.findMany({
//             where: Object.keys(where).length > 0 ? where : undefined,
//             include: {
//                 characteristics: true,
//                 images: true,
//             },
//         });
//
//         console.log("después del find many");
//         const properties: PropertyTypes[] = propertiesRaw.map((p) => ({
//             id: p.idProperty,
//             address: p.address || '',
//             city: '',
//             state: mapOperationToState(p.category),
//             price: p.price || 0,
//             description: p.description || '',
//             type: mapPropertyType(p.type),
//
//             characteristics: p.characteristics.map((c): Characteristic => ({
//                 id: c.idCharacteristic,
//                 characteristic: c.characteristic,
//                 data_type: c.dataType === 'integer' ? 'integer' : 'text',
//                 value_integer: c.valueInteger ?? undefined,
//                 value_text: c.valueText?.trim() || undefined,
//                 category: mapPrismaCharacteristicCategory(c.category || null),
//             })),
//             ubication: p.ubication || '',
//
//             images: (() => {
//                 const mainimage = p.images[0];
//                 return mainimage ? [{ id: mainimage.idImage, url: mainimage.url! }] : [];
//             })(),
//         }));
//
//
//
//         return NextResponse.json(properties);
//     } catch (error) {
//         console.error('Error en GET /api/properties:', error);
//         return new NextResponse('Error al obtener propiedades', { status: 500 });
//     }
// }


export async function POST(request: NextRequest) {
  try {
    const body: CreatePublicationDTO = await request.json();

	const property = await propertyService.create(body);

	return NextResponse.json(property, { status: 201 });

  } catch (error) {
	  if (error instanceof ZodError) {
		  return NextResponse.json(
			  { errors: error.errors },
			  { status: 400 }
		  );
	  }

	  return NextResponse.json(
		  { error: 'Error interno' },
		  { status: 500 }
	  );
  }
}