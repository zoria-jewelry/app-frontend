import { AbstractApiClient } from './abstractApiClient.ts';
import type { ProductEntryDto } from '../dto/products.ts';

export class ProductsApiClient extends AbstractApiClient {
    public static async getAll(searchPhrase: string): Promise<ProductEntryDto[] | undefined> {
        console.log(`ProductsApiClient.getAll`);
        const response = await fetch('/products.json');
        const json = (await response.json()) as unknown as { entries: ProductEntryDto[] };
        return json.entries.filter((e) =>
            e.name.toLowerCase().includes(searchPhrase.toLowerCase()),
        );
        // TODO: use me - const res = await this.apiRequest<{ pages: ProductEntryDto[] }>({});
        // return res?.pages[page];
    }
}
