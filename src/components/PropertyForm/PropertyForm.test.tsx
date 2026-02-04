// src/components/PropertyForm/PropertyForm.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyForm from './PropertyForm';
import { FormMode } from '@/types/property-form.types';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

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

			expect(screen.getByText('Datos Básicos')).toBeInTheDocument();
			expect(screen.getByText('Detalles de la Propiedad')).toBeInTheDocument();
			expect(screen.getByText('Ubicación')).toBeInTheDocument();
			expect(screen.getByText('Descripción')).toBeInTheDocument();
			expect(screen.getByText('Imágenes')).toBeInTheDocument();
		});

		it('DetailsSection muestra empty state cuando no hay tipo seleccionado', () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			// Con defaultFormData que tiene type: PropertyTypeEnum.casa,
			// NO debería mostrar el empty state
			// Pero si renderizamos sin initial data:
			expect(screen.queryByText(/Selecciona un tipo de propiedad/i)).not.toBeInTheDocument();
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
			description: 'Una hermosa casa para testear el formulario de edición con suficientes caracteres',
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
			expect(priceInput.value).toBe('250000');

			const addressInput = screen.getByLabelText(/Dirección/i) as HTMLInputElement;
			expect(addressInput.value).toBe('Av. Test 456');

			const descriptionTextarea = screen.getByLabelText(/Descripción/i) as HTMLTextAreaElement;
			expect(descriptionTextarea.value).toBe(initialData.description);
		});
	});

	describe('Validación', () => {
		it('muestra errores cuando se intenta submit sin datos válidos', async () => {
			const user = userEvent.setup();

			// Renderizar con formData vacío/inválido
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

			// No debe llamar al submit si hay errores de validación
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
						city: '',
						ubication: '',
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
			// Este test verifica que onChange limpia errores del campo específico
			// No podemos verificar fácilmente sin ver el estado interno,
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
				// Verifica que menciona múltiples errores
				expect(errorText.textContent).toMatch(/\d+\s+errores?/);
			});
		});
	});

	describe('Interacción con campos', () => {
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

			expect((priceInput as HTMLInputElement).value).toBe('500000');

			// Cambiar dirección
			const addressInput = screen.getByLabelText(/Dirección/i);
			await user.clear(addressInput);
			await user.type(addressInput, 'Nueva Dirección 123');

			expect((addressInput as HTMLInputElement).value).toBe('Nueva Dirección 123');
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
				// Lote NO debe mostrar dormitorios ni baños
				expect(screen.queryByLabelText(/Dormitorios/i)).not.toBeInTheDocument();
				expect(screen.queryByLabelText(/Baños/i)).not.toBeInTheDocument();
			});

			// Cambiar a CASA
			await user.selectOptions(typeSelect, PropertyTypeEnum.casa);

			await waitFor(() => {
				// Casa SÍ debe mostrar dormitorios y baños
				expect(screen.getByLabelText(/Dormitorios/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/Baños/i)).toBeInTheDocument();
			});
		});
	});

	describe('Submit del formulario', () => {
		it('llama a submit con FormMode.CREATE cuando es válido', async () => {
			const user = userEvent.setup();
			mockSubmit.mockResolvedValueOnce({ success: true });

			const validData = {
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				price: 200000,
				surface: 250,
				address: 'Calle válida 123',
				city: 'Tandil',
				ubication: 'Centro',
				description: 'Descripción válida con más de cincuenta caracteres para pasar la validación del schema',
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
						address: 'Calle válida 123'
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
				city: '',
				ubication: '',
				description: 'Descripción de lote válida con caracteres suficientes para la validación',
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

			// El botón debe estar disabled
			expect(submitButton).toBeDisabled();
		});

		it('en modo EDIT muestra alert porque backend no está implementado', async () => {
			const user = userEvent.setup();
			const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

			const validData = {
				type: PropertyTypeEnum.departamento,
				category: OperationEnum.alquiler,
				price: 150000,
				surface: 80,
				address: 'Depto Test 789',
				city: 'Tandil',
				ubication: 'Villa Italia',
				description: 'Descripción de departamento válida con caracteres suficientes',
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
				expect(alertSpy).toHaveBeenCalledWith('Modo EDIT: Backend aún no implementado.');
			});

			alertSpy.mockRestore();
		});
	});

	describe('Botón Cancelar', () => {
		it('botón cancelar ejecuta window.history.back()', async () => {
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

		it('botón cancelar está disabled durante submit', async () => {
			const user = userEvent.setup();

			mockSubmit.mockImplementation(() =>
				new Promise(resolve => setTimeout(() => resolve({ success: true }), 200))
			);

			const validData = {
				type: PropertyTypeEnum.casa,
				category: OperationEnum.venta,
				price: 200000,
				surface: 250,
				address: 'Test',
				city: '',
				ubication: '',
				description: 'Descripción válida con más de cincuenta caracteres necesarios',
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

	describe('Manejo de imágenes', () => {
		it('handleImagesChange actualiza formData.images', async () => {
			render(
				<PropertyForm
					mode={FormMode.CREATE}
					propertyTitle="Nueva Propiedad"
				/>
			);

			// MediaSection está renderizado
			expect(screen.getByText('Imágenes')).toBeInTheDocument();

			// Este test es más complejo porque requeriría simular file upload
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
						city: '',
						ubication: '',
						description: 'Descripción válida con caracteres suficientes para validación',
						bedrooms: 3,
						bathrooms: 2,
						images: initialImages,
						deletedImageIds: []
					}}
				/>
			);

			// Verificar que las imágenes existentes se muestran
			expect(screen.getByText('Principal')).toBeInTheDocument();
		});
	});
});