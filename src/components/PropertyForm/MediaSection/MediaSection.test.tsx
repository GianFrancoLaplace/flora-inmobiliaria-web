import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MediaSection from "./MediaSection";

// Mock de URL.createObjectURL (obligatorio para evitar errores en JSDOM)
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/mock-preview");

describe("MediaSection Component", () => {
	const mockOnChange = vi.fn();
	const defaultProps = {
		value: [],
		onChange: mockOnChange,
		errors: {},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("debe mostrar el dropzone cuando no hay imágenes", () => {
		render(<MediaSection {...defaultProps} />);

		expect(screen.getByText(/arrastra imágenes aquí/i)).toBeInTheDocument();
	});

	it("debe procesar archivos subidos mediante el input de archivos", async () => {
		const user = userEvent.setup();
		render(<MediaSection {...defaultProps} />);

		// Buscamos el input oculto por su atributo type
		const input = screen.getByTestId("file-input") || document.querySelector('input[type="file"]');
		const file = new File(["content"], "propiedad.jpg", { type: "image/jpeg" });

		if (!input) throw new Error("Input de archivo no encontrado");

		await user.upload(input, [file]);

		// Verificamos que onChange fue llamado con la nueva imagen marcada como principal
		expect(mockOnChange).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'new',
					isMain: true, // La primera siempre es principal según tu lógica
				})
			])
		);
	});

	it("debe mostrar la galería cuando ya existen imágenes", () => {
		const existingImages = [
			{ type: 'existing', id: '1', url: '/img1.jpg', position: 0, isMain: true },
		];

		render(<MediaSection {...defaultProps} value={existingImages as any} />);

		expect(screen.getByAltText(/imagen 1/i)).toBeInTheDocument();
		expect(screen.getByText(/principal/i)).toBeInTheDocument();
	});

	it("debe permitir cambiar la imagen principal al hacer clic en el icono de estrella", async () => {
		const user = userEvent.setup();
		const images = [
			{ type: 'existing', id: '1', url: '/1.jpg', position: 0, isMain: true },
			{ type: 'existing', id: '2', url: '/2.jpg', position: 1, isMain: false },
		];

		render(<MediaSection {...defaultProps} value={images as any} />);

		// Buscamos el botón de la segunda imagen (el de marcar como principal)
		const mainButtons = screen.getAllByTitle(/marcar como principal/i);
		await user.click(mainButtons[1]);

		// Verificamos que se llamó a onChange con la segunda imagen como isMain: true
		expect(mockOnChange).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ id: '1', isMain: false }),
				expect.objectContaining({ id: '2', isMain: true }),
			])
		);
	});

	it("debe mostrar un mensaje de error si la prop errors contiene imágenes", () => {
		render(<MediaSection {...defaultProps} errors={{ images: "Debes subir al menos una foto" }} />);

		expect(screen.getByText(/debes subir al menos una foto/i)).toBeInTheDocument();
	});
});