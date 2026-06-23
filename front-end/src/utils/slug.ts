export function normalizeSlug(value: string) {
	return String(value ?? '')
		.toLowerCase()
		.replace(/đ/g, 'd')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}
