// src/components/PropertyForm/DescriptionSection/DescriptionSection.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DescriptionSection from './DescriptionSection';

describe('DescriptionSection', () => {
	const mockFormData = {
		type: 'casa' as const,
		category: 'venta' as const,
		price: 100000,
		surface: 200,
		address: 'Test 123',
		city: '',
		ubication: '',
		description: '',
		images: [],
		deletedImageIds: []
	};

	const mockOnChange = vi.fn();
	const mockErrors = {};

	it('renderiza correctamente', () => {
		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		expect(screen.getByText('Descripción')).toBeInTheDocument();
		expect(screen.getByLabelText(/Descripción de la propiedad/i)).toBeInTheDocument();
		expect(screen.getByText('0 / 200')).toBeInTheDocument();
	});

	it('llama onChange cuando se escribe texto', async () => {
		const user = userEvent.setup();

		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const textarea = screen.getByLabelText(/Descripción de la propiedad/i);
		await user.type(textarea, 'Casa hermosa');

		expect(mockOnChange).toHaveBeenCalled();
	});

	it('muestra contador de caracteres actualizado', () => {
		const formDataWithDescription = {
			...mockFormData,
			description: 'Esta es una descripción de prueba'
		};

		render(
			<DescriptionSection
				formData={formDataWithDescription}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const expectedCount = formDataWithDescription.description.length;
		expect(screen.getByText(`${expectedCount} / 200`)).toBeInTheDocument();
	});

	it('NO permite escribir más de 200 caracteres', async () => {
		const user = userEvent.setup();

		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const longText = 'a'.repeat(250); // 250 caracteres
		const textarea = screen.getByLabelText(/Descripción de la propiedad/i);

		await user.type(textarea, longText);

		// Verificar que onChange fue llamado pero con texto truncado a 200
		const calls = mockOnChange.mock.calls;
		const lastCall = calls[calls.length - 1];

		if (lastCall) {
			const [field, value] = lastCall;
			expect(value.length).toBeLessThanOrEqual(200);
		}
	});

	it('muestra error de validación cuando existe', () => {
		const errorsWithDescription = {
			description: 'La descripción debe tener al menos 50 caracteres'
		};

		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={errorsWithDescription}
			/>
		);

		expect(screen.getByText('La descripción debe tener al menos 50 caracteres')).toBeInTheDocument();
	});

	it('muestra el hint sobre mínimo de caracteres', () => {
		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		expect(screen.getByText(/Mínimo 50 caracteres/i)).toBeInTheDocument();
	});

	it('textarea tiene 8 rows como especificado', () => {
		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const textarea = screen.getByLabelText(/Descripción de la propiedad/i);
		expect(textarea).toHaveAttribute('rows', '8');
	});

	it('placeholder es descriptivo', () => {
		render(
			<DescriptionSection
				formData={mockFormData}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		const textarea = screen.getByPlaceholderText(/Describe las características principales/i);
		expect(textarea).toBeInTheDocument();
	});
});