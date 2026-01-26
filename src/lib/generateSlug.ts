export function crearSlug(titulo: string): string {
	const slug = titulo
		.toLowerCase() // Todo a minúsculas
		.trim()
		.replace(/[\s\W-]+/g, '-') // Reemplaza espacios y caracteres raros por guiones
		.replace(/^-+|-+$/g, ''); // Elimina guiones al inicio o final

	// Retornamos estructura: titulo-descriptivo
	// Ejemplo: venta-casa-centro-tandil
	return `${slug}`;
}