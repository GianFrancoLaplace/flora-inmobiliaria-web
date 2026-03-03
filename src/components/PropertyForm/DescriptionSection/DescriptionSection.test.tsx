import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DescriptionSection from './DescriptionSection';
import type { PropertyFormInput } from '@/types/property-form.types';

describe('DescriptionSection', () => {
	const mockFormData: PropertyFormInput = {
		type: 'casa',
		category: 'venta',
		price: 100000,
		currency: 'USD',
		surface: 200,
		address: 'Test 123',
		city: '',
		ubication: '',
		description: '',
		services: [],
		images: [],
		deletedImageIds: []
	};

	const mockOnChange = vi.fn();
	const mockErrors = {};

	it('renderiza con contador inicial 0 / 1000', () => {
		render(
			<DescriptionSection formData={mockFormData} onChange={mockOnChange} errors={mockErrors} />
		);

		expect(screen.getByRole('heading', { name: /Descripci.n/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/Descripci.n de la propiedad/i)).toBeInTheDocument();
		expect(screen.getByText('0 / 1000')).toBeInTheDocument();
	});

	it('llama onChange cuando se escribe texto', async () => {
		const user = userEvent.setup();
		render(
			<DescriptionSection formData={mockFormData} onChange={mockOnChange} errors={mockErrors} />
		);

		const textarea = screen.getByLabelText(/Descripci.n de la propiedad/i);
		await user.type(textarea, 'Casa hermosa');

		expect(mockOnChange).toHaveBeenCalled();
	});

	it('muestra contador actualizado con descripcion existente', () => {
		const formDataWithDescription: PropertyFormInput = {
			...mockFormData,
			description: 'Esta es una descripcion de prueba',
		};

		render(
			<DescriptionSection
				formData={formDataWithDescription}
				onChange={mockOnChange}
				errors={mockErrors}
			/>
		);

		expect(screen.getByText(`${formDataWithDescription.description.length} / 1000`)).toBeInTheDocument();
	});

	it('no permite escribir mas de 1000 caracteres', async () => {
		render(
			<DescriptionSection formData={mockFormData} onChange={mockOnChange} errors={mockErrors} />
		);

		const longText = 'a'.repeat(1200);
		const textarea = screen.getByLabelText(/Descripci.n de la propiedad/i);
		fireEvent.change(textarea, { target: { value: longText } });

		const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
		expect(lastCall).toBeTruthy();
		expect(lastCall[0]).toBe('description');
		expect(lastCall[1].length).toBeLessThanOrEqual(1000);
	});
});
