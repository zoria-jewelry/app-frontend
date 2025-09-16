import { AbstractApiClient } from './abstractApiClient.ts';
import type { ProductEntryDto } from '../dto/products.ts';
import type { CreateProductFormData } from '../validation/schemas.ts';

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
        await this.apiRequest<void>({ url: `/products/`, method: 'POST', data });
    }
}
