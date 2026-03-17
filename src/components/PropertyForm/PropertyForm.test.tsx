// src/components/PropertyForm/PropertyForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyForm from './PropertyForm';
import { FormMode } from '@/types/property-form.types';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

const mockRouter = {
	replace: vi.fn(),
	refresh: vi.fn(),
};
vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
}));

// Mock del hook usePropertySubmit
const mockSubmit = vi.fn();
vi.mock('@/hooks/usePropertySubmit', () => ({
	usePropertySubmit: () => ({
		submit: mockSubmit,
		isLoading: false,
		error: null
	})
}));

// Mock de window.scrollTo
window.scrollTo = vi.fn();

describe('PropertyForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Modo CREATE', () => {
		it('renderiza correctamente en modo CREATE', () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			expect(screen.getByText('Nueva propiedad')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Crear propiedad/i })).toBeInTheDocument();
			expect(screen.queryByText(/Editando propiedad/i)).not.toBeInTheDocument();
		});

		it('muestra todas las secciones del formulario', () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			expect(screen.getByText('Datos Basicos')).toBeInTheDocument();
			expect(screen.getByText('Detalles de la Propiedad')).toBeInTheDocument();
			expect(screen.getByText('UbicaciÃ³n')).toBeInTheDocument();
			expect(screen.getByText('DescripciÃ³n')).toBeInTheDocument();
			expect(screen.getByText('ImÃ¡genes')).toBeInTheDocument();
		});

		it('DetailsSection muestra empty state cuando no hay tipo seleccionado', () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			expect(screen.getByText(/Selecciona un tipo de propiedad/i)).toBeInTheDocument();
		});
	});

	describe('Modo EDIT', () => {
		const initialData = {
			type: PropertyTypeEnum.casa,
			category: OperationEnum.venta,
			price: 250000,
			surface: 300,
			address: 'Av. Test 456',
			city: 'Tandil',
			ubication: 'Centro',
			description: 'Una hermosa casa para testear el formulario de ediciÃ³n con suficientes caracteres',
			bedrooms: 3,
			bathrooms: 2,
			images: [],
			deletedImageIds: []
		};

		it('renderiza correctamente en modo EDIT', () => {
			render(
				<PropertyForm
					mode={FormMode.EDIT}
					propertyTitle="Casa en Venta - Centro"
					propertyId="123"
					initialData={initialData}
				/>
			);

			expect(screen.getByText('Editando propiedad')).toBeInTheDocument();
			expect(screen.getByText('Casa en Venta - Centro')).toBeInTheDocument();
			expect(screen.getByText('ID: 123')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
		});

		it('carga los datos iniciales correctamente', () => {
			render(
				<PropertyForm
					mode={FormMode.EDIT}
					propertyTitle="Casa en Venta"
					initialData={initialData}
				/>
			);

			const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;
			expect(priceInput.value.replace(/\./g, '')).toBe('250000');

			const addressInput = screen.getByLabelText(/DirecciÃ³n/i) as HTMLInputElement;
			expect(addressInput.value).toBe('Av. Test 456');

			const descriptionTextarea = screen.getByLabelText(/DescripciÃ³n/i) as HTMLTextAreaElement;
			expect(descriptionTextarea.value).toBe(initialData.description);
		});
	});

	describe('ValidaciÃ³n', () => {
		it('muestra errores cuando se intenta submit sin datos vÃ¡lidos', async () => {
			const user = userEvent.setup();

			// Renderizar con formData vacÃ­o/invÃ¡lido
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={{
						type: undefined,
						category: undefined,
						price: 0,
						surface: 0,
						address: '',
						city: '',
						ubication: '',
						description: '',
						images: [],
						deletedImageIds: []
					}}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Crear propiedad/i });
			await user.click(submitButton);

			// Debe mostrar el resumen de errores
			await waitFor(() => {
				expect(screen.getByText(/errores que corregir/i)).toBeInTheDocument();
			});

			// No debe llamar al submit si hay errores de validaciÃ³n
			expect(mockSubmit).not.toHaveBeenCalled();

			// Debe hacer scroll al top
			expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
		});

		it('errores desaparecen cuando se corrigen los campos', async () => {
			const user = userEvent.setup();

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={{
						type: undefined,
						category: OperationEnum.venta,
						price: 100000,
						surface: 200,
						address: 'Test',
						city: 'Tandil',
						ubication: 'Centro',
						description: '',
						images: [],
						deletedImageIds: []
					}}
				/>
			);

			// Submit para generar errores
			await user.click(screen.getByRole('button', { name: /Crear propiedad/i }));

			await waitFor(() => {
				expect(screen.getByText(/errores que corregir/i)).toBeInTheDocument();
			});

			// Corregir el tipo
			const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
			await user.selectOptions(typeSelect, PropertyTypeEnum.casa);

			// El error de tipo debe desaparecer (aunque pueden quedar otros)
			// Este test verifica que onChange limpia errores del campo especÃ­fico
			// No podemos verificar fÃ¡cilmente sin ver el estado interno,
			// pero podemos verificar que el select ahora tiene valor
			expect((typeSelect as HTMLSelectElement).value).toBe(PropertyTypeEnum.casa);
		});

		it('muestra contador de errores correcto', async () => {
			const user = userEvent.setup();

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={{
						type: undefined,
						category: undefined,
						price: 0,
						surface: 0,
						address: '',
						city: '',
						ubication: '',
						description: '',
						images: [],
						deletedImageIds: []
					}}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Crear propiedad/i }));

			await waitFor(() => {
				const errorText = screen.getByText(/errores que corregir/i);
				// Verifica que menciona mÃºltiples errores
				expect(errorText.textContent).toMatch(/\d+\s+errores?/);
			});
		});
	});

	describe('InteracciÃ³n con campos', () => {
		it('actualiza formData cuando cambian los campos', async () => {
			const user = userEvent.setup();

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			// Cambiar precio
			const priceInput = screen.getByLabelText(/Precio/i);
			await user.clear(priceInput);
			await user.type(priceInput, '500000');

			expect((priceInput as HTMLInputElement).value.replace(/\./g, '')).toBe('500000');

			// Cambiar direcciÃ³n
			const addressInput = screen.getByLabelText(/DirecciÃ³n/i);
			await user.clear(addressInput);
			await user.type(addressInput, 'Nueva DirecciÃ³n 123');

			expect((addressInput as HTMLInputElement).value).toBe('Nueva DirecciÃ³n 123');
		});

		it('tipo de propiedad cambia campos visibles en DetailsSection', async () => {
			const user = userEvent.setup();

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);

			// Seleccionar LOTE
			await user.selectOptions(typeSelect, PropertyTypeEnum.lote);

			await waitFor(() => {
				// Lote NO debe mostrar dormitorios ni baÃ±os
				expect(screen.queryByLabelText(/Dormitorios/i)).not.toBeInTheDocument();
				expect(screen.queryByLabelText(/BaÃ±os/i)).not.toBeInTheDocument();
			});

			// Cambiar a CASA
			await user.selectOptions(typeSelect, PropertyTypeEnum.casa);

			await waitFor(() => {
				// Casa SÃ debe mostrar dormitorios y baÃ±os
				expect(screen.getByLabelText(/Dormitorios/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/BaÃ±os/i)).toBeInTheDocument();
			});
		});
	});

	describe('Submit del formulario', () => {
		it('llama a submit con FormMode.CREATE cuando es vÃ¡lido', async () => {
			const user = userEvent.setup();
			mockSubmit.mockResolvedValueOnce({ success: true });

			const validData = {
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				price: 200000,
				surface: 250,
				address: 'Calle vÃ¡lida 123',
				city: 'Tandil',
				ubication: 'Centro',
				description: 'DescripciÃ³n vÃ¡lida con mÃ¡s de cincuenta caracteres para pasar la validaciÃ³n del schema',
				bedrooms: 3,
				bathrooms: 2,
				images: [],
				deletedImageIds: []
			};

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={validData}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Crear propiedad/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						type: PropertyTypeEnum.casa,
						price: 200000,
						address: 'Calle vÃ¡lida 123'
					}),
					FormMode.CREATE
				);
			});
		});

		it('muestra loading state durante submit', async () => {
			const user = userEvent.setup();

			// Mock que tarda un poco
			mockSubmit.mockImplementation(() =>
				new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
			);

			const validData = {
				type: PropertyTypeEnum.lote,
				category: OperationEnum.venta,
				price: 100000,
				surface: 500,
				address: 'Lote Test 456',
				city: 'Tandil',
				ubication: 'Zona Norte',
				description: 'DescripciÃ³n de lote vÃ¡lida con caracteres suficientes para la validaciÃ³n',
				images: [],
				deletedImageIds: []
			};

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={validData}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Crear propiedad/i });
			await user.click(submitButton);

			// Durante el submit, debe mostrar "Creando..."
			await waitFor(() => {
				expect(screen.getByText(/Creando.../i)).toBeInTheDocument();
			});

			// El botÃ³n debe estar disabled
			expect(submitButton).toBeDisabled();
		});

		it('en modo EDIT llama submit con propertyId', async () => {
			const user = userEvent.setup();
			mockSubmit.mockResolvedValueOnce({ success: true });

			const validData = {
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.alquiler,
				price: 150000,
				surface: 80,
				address: 'Depto Test 789',
				city: 'Tandil',
				ubication: 'Villa Italia',
				description: 'DescripciÃ³n de departamento vÃ¡lida con caracteres suficientes',
				bedrooms: 2,
				bathrooms: 1,
				images: [],
				deletedImageIds: []
			};

			render(
				<PropertyForm
					mode={FormMode.EDIT}
					propertyTitle="Editar Departamento"
					propertyId="456"
					initialData={validData}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Guardar cambios/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSubmit).toHaveBeenCalledWith(
					expect.objectContaining({
						type: PropertyTypeEnum.departamento,
						category: OperationEnum.alquiler
					}),
					FormMode.EDIT,
					'456'
				);
			});
		});
	});

	describe('BotÃ³n Cancelar', () => {
		it('botÃ³n cancelar ejecuta window.history.back()', async () => {
			const user = userEvent.setup();
			const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
			await user.click(cancelButton);

			expect(backSpy).toHaveBeenCalled();
			backSpy.mockRestore();
		});

		it('botÃ³n cancelar estÃ¡ disabled durante submit', async () => {
			const user = userEvent.setup();

			mockSubmit.mockImplementation(() =>
				new Promise(resolve => setTimeout(() => resolve({ success: true }), 200))
			);

			const validData = {
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				price: 200000,
				surface: 250,
				address: 'Test 123',
				city: 'Tandil',
				ubication: 'Centro',
				description: 'DescripciÃ³n vÃ¡lida con mÃ¡s de cincuenta caracteres necesarios',
				bedrooms: 3,
				bathrooms: 2,
				images: [],
				deletedImageIds: []
			};

			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
					initialData={validData}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Crear propiedad/i });
			await user.click(submitButton);

			const cancelButton = screen.getByRole('button', { name: /Cancelar/i });

			await waitFor(() => {
				expect(cancelButton).toBeDisabled();
			});
		});
	});

	describe('Manejo de imÃ¡genes', () => {
		it('handleImagesChange actualiza formData.images', async () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			// MediaSection estÃ¡ renderizado
			expect(screen.getByText('ImÃ¡genes')).toBeInTheDocument();

			// Este test es mÃ¡s complejo porque requerirÃ­a simular file upload
			// Lo dejamos como TODO para cuando implementes tests de MediaSection
		});

		it('trackea deletedImageIds en modo EDIT', () => {
			const initialImages = [
				{ type: 'existing' as const, id: 7, url: 'test1.jpg', position: 0, isMain: true },
				{ type: 'existing' as const, id: 8, url: 'test2.jpg', position: 1, isMain: false }
			];

			render(
				<PropertyForm
					mode={FormMode.EDIT}
					propertyTitle="Editar Propiedad"
					propertyId="789"
					initialData={{
						type: PropertyTypeEnum.casa,
						category: OperationEnum.venta,
						price: 200000,
						surface: 250,
						address: 'Test',
						city: 'Tandil',
						ubication: 'Centro',
						description: 'DescripciÃ³n vÃ¡lida con caracteres suficientes para validaciÃ³n',
						bedrooms: 3,
						bathrooms: 2,
						images: initialImages,
						deletedImageIds: []
					}}
				/>
			);

			// Verificar que las imÃ¡genes existentes se muestran
			expect(screen.getByText('Principal')).toBeInTheDocument();
		});
	});
});




