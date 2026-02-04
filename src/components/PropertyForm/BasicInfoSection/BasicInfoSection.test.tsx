// src/components/PropertyForm/BasicInfoSection/BasicInfoSection.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BasicInfoSection from '@/components/PropertyForm/BasicInfoSection/BasicInfoSection';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

describe('BasicInfoSection', () => {
	const mockFormData = {
		type: PropertyTypeEnum.casa,
		category: OperationEnum.venta,
		price: 100000,
		surface: 200,
		address: 'Test 123',
		city: '',
		ubication: '',
		description: 'Test description that is long enough to pass validation',
		images: [],
		deletedImageIds: []
	};

	const mockOnChange = vi.fn();
	const mockErrors = {};

	it('renderiza todos los campos correctamente', () => {
		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		// Heading de la sección
		expect(screen.getByText('Datos Básicos')).toBeInTheDocument();

		// Label de operación (no asociado a input, solo texto)
		expect(screen.getByText(/Operación/i)).toBeInTheDocument();

		// Radio buttons por su label text
		expect(screen.getByLabelText('Venta')).toBeInTheDocument();
		expect(screen.getByLabelText('Alquiler')).toBeInTheDocument();

		// Select de tipo (tiene htmlFor correcto)
		expect(screen.getByLabelText(/Tipo de propiedad/i)).toBeInTheDocument();

		// Input de precio (tiene htmlFor correcto)
		expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
	});

	it('radio de Venta está checked cuando category es venta', () => {
		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const ventaRadio = screen.getByLabelText('Venta') as HTMLInputElement;
		expect(ventaRadio.checked).toBe(true);
	});

	it('llama onChange cuando cambia de Venta a Alquiler', () => {
		render(
			<BasicInfoSection
				formData={mockFormData} // category: venta
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const alquilerRadio = screen.getByLabelText('Alquiler');
		fireEvent.click(alquilerRadio);

		expect(mockOnChange).toHaveBeenCalledWith('category', OperationEnum.alquiler);
	});

	it('llama onChange cuando cambia el tipo de propiedad', () => {
		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const typeSelect = screen.getByLabelText(/Tipo de propiedad/i);
		fireEvent.change(typeSelect, { target: { value: PropertyTypeEnum.departamento } });

		expect(mockOnChange).toHaveBeenCalledWith('type', PropertyTypeEnum.departamento);
	});

	it('llama onChange cuando cambia el precio', () => {
		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const priceInput = screen.getByLabelText(/Precio/i);
		fireEvent.change(priceInput, { target: { value: '150000' } });

		expect(mockOnChange).toHaveBeenCalledWith('price', 150000);
	});

	it('muestra error de validación en el precio', () => {
		const errorsWithPrice = { price: 'El precio es requerido' };

		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={errorsWithPrice}
			/>
		);

		expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
	});

	it('muestra error de validación en el tipo', () => {
		const errorsWithType = { type: 'Tipo de propiedad inválido' };

		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={errorsWithType}
			/>
		);

		expect(screen.getByText('Tipo de propiedad inválido')).toBeInTheDocument();
	});

	it('input de precio no acepta valores negativos (HTML validation)', () => {
		render(
			<BasicInfoSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const priceInput = screen.getByLabelText(/Precio/i) as HTMLInputElement;
		expect(priceInput.min).toBe('0');
	});
});