import { AbstractApiClient } from './abstractApiClient.ts';
import type { ProductEntryDto } from '../dto/products.ts';
import type { CreateProductFormData, UpdateProductFormData } from '../validation/schemas.ts';

/** Backend rejects `pictureBase64` when the key is sent blank; the form’s hidden field can be `""`. */
function sanitizeProductPayload<T extends { pictureBase64?: string }>(data: T): T {
    const out = { ...data };
    if (out.pictureBase64 == null || !String(out.pictureBase64).trim()) {
        delete out.pictureBase64;
    }
    return out;
}

export class ProductsApiClient extends AbstractApiClient {
    public static async getAll(searchPhrase: string): Promise<ProductEntryDto[] | undefined> {
        console.log(`ProductsApiClient.getAll`);
        return await this.apiRequest<ProductEntryDto[]>({
            url: '/products/',
            params: { search: searchPhrase, isArchived: false },
        });
    }

    public static async getArchived(): Promise<ProductEntryDto[] | undefined> {
        console.log(`ProductsApiClient.getArchived`);
        return await this.apiRequest<ProductEntryDto[]>({
            url: '/products/',
            params: { isArchived: true },
        });
    }

    public static async moveToArchive(id: number): Promise<void> {
        console.log(`ProductsApiClient.moveToArchive: id=${id}`);
        await this.apiRequest<void>({
            url: `/products/${id}/`,
            method: 'PATCH',
            data: { isArchived: true },
        });
    }

    public static async removeFromArchive(id: number): Promise<void> {
        console.log(`ProductsApiClient.removeFromArchive: ${id}`);
        await this.apiRequest<void>({
            url: `/products/${id}/`,
            method: 'PATCH',
            data: { isArchived: false },
        });
    }

    public static async create(data: CreateProductFormData): Promise<void> {
        console.log(`ProductsApiClient.create: data=${data}`);
        await this.apiRequest<void>({
            url: `/products/`,
            method: 'POST',
            data: sanitizeProductPayload(data),
        });
    }

    public static async getById(id: number): Promise<ProductEntryDto | undefined> {
        console.log(`ProductsApiClient.getById: ${id}`);
        const products = await this.getAll('');
        return products?.find((p) => p.id === id);
    }

    public static async update(id: number, data: UpdateProductFormData): Promise<void> {
        console.log(`ProductsApiClient.update: id=${id}, data`);
        await this.apiRequest<void>({
            url: `/products/${id}/`,
            method: 'PATCH',
            data: sanitizeProductPayload(data),
        });
    }
}
