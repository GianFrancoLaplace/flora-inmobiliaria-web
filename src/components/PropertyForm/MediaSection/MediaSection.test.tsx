import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MediaSection from "./MediaSection";

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

	it("shows dropzone when there are no images", () => {
		render(<MediaSection {...defaultProps} />);
		expect(screen.getByText(/arrastra im/i)).toBeInTheDocument();
	});

	it("uploads files from file input", async () => {
		const user = userEvent.setup();
		render(<MediaSection {...defaultProps} />);

		const input = screen.getByTestId("file-input");
		const file = new File(["content"], "propiedad.jpg", { type: "image/jpeg" });

		await user.upload(input, [file]);

		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: "new",
						isMain: true,
					}),
				]),
			);
		});
	});

	it("shows gallery when images already exist", () => {
		const existingImages = [
			{ type: "existing", id: "1", url: "/img1.jpg", position: 0, isMain: true },
		];

		render(<MediaSection {...defaultProps} value={existingImages as any} />);

		expect(screen.getByAltText(/imagen 1/i)).toBeInTheDocument();
		expect(screen.getByText(/principal/i)).toBeInTheDocument();
	});

	it("can change main image by clicking star action", async () => {
		const user = userEvent.setup();
		const images = [
			{ type: "existing", id: "1", url: "/1.jpg", position: 0, isMain: true },
			{ type: "existing", id: "2", url: "/2.jpg", position: 1, isMain: false },
		];

		render(<MediaSection {...defaultProps} value={images as any} />);

		const mainButtons = screen.getAllByTitle(/marcar como principal/i);
		await user.click(mainButtons[1]);

		expect(mockOnChange).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ id: "1", isMain: false }),
				expect.objectContaining({ id: "2", isMain: true }),
			]),
		);
	});

	it("shows error when images error exists", () => {
		render(<MediaSection {...defaultProps} errors={{ images: "Debes subir al menos una foto" }} />);
		expect(screen.getByText(/debes subir al menos una foto/i)).toBeInTheDocument();
	});

	it("accepts empty mime type when extension is valid (iphone case)", async () => {
		render(<MediaSection {...defaultProps} />);

		const input = screen.getByTestId("file-input");
		const heicFile = new File(["content"], "foto.HEIC", { type: "" });

		fireEvent.change(input, { target: { files: [heicFile] } });

		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: "new",
						isMain: true,
					}),
				]),
			);
		});
	});
});
