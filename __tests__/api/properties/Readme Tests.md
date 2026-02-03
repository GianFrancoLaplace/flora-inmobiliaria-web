# Tests del POST /api/properties

## ¿Qué testea esto?

Validación completa del endpoint POST para creación de propiedades, incluyendo validaciones condicionales según tipo de propiedad (casa/departamento/terreno) y manejo de imágenes con Cloudinary.

## ¿Cómo ejecuto los tests?

```bash
pnpm test route.test.ts
pnpm test route.test.ts --watch  # Modo watch para desarrollo
```

## Estructura de Tests

- **Happy Path**: Creación exitosa para cada tipo (casa, departamento, terreno)
- **Validation Errors**: Validaciones condicionales y campos base
- **Image Validation**: Metadata de imágenes y reglas de negocio
- **Error Handling**: Rollback de Cloudinary en fallas de DB
- **Edge Cases**: Casos límite y manejo de errores

## ¿Qué necesito saber que no es obvio?

### Validaciones Condicionales por Tipo

**CASA** requiere obligatoriamente:
- `bedrooms` (≥1)
- `bathrooms` (≥1)
- Regla de negocio: `constructedArea` debe ser ≤ `surface`

**DEPARTAMENTO** requiere obligatoriamente:
- `bedrooms` (≥1)
- `bathrooms` (≥1)

**TERRENO** solo requiere campos base:
- NO necesita bedrooms, bathrooms, constructedArea, floors, garage

### Arquitectura de Tests

Los tests siguen el patrón AAA (Arrange-Act-Assert):
1. **Arrange**: Factories de datos específicos por tipo de propiedad
2. **Act**: Mock de servicios externos (ImageService, Prisma)
3. **Assert**: Verificación de status codes y estructura de respuesta

### Rollback de Cloudinary

IMPORTANTE: Si la transacción de DB falla DESPUÉS de subir a Cloudinary, el service debe hacer cleanup automático. Los tests verifican que `deleteMultiple()` se llame con los publicIds correctos.

### Data Factories

Usa los factories predefinidos para consistency:
- `validCasaData`: Casa completa con todos los campos
- `validDepartamentoData`: Departamento sin constructedArea/floors
- `validTerrenoData`: Terreno solo con campos base

No modifiques los factories directamente en tests - créate copias para casos de error:
```typescript
const invalidCasa = { ...validCasaData, bedrooms: undefined };
```

## Debugging

Si un test falla:
1. Verifica que el schema de validación (`property.schema.ts`) no haya cambiado
2. Chequea los mocks de Prisma - los types deben matchear exactamente
3. Los errors de Zod vienen en `data.errors` array
4. Cloudinary errors previenen que se ejecute la transaction (check console.error)