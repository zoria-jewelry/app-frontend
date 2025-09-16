import { AbstractApiClient } from './abstractApiClient.ts';
import type { PriceListBundleDto, PriceListDto } from '../dto/price-lists.ts';

export class PriceListsApiClient extends AbstractApiClient {
    public static async getActiveListDetails(): Promise<PriceListDto | undefined> {
        console.log(`PriceListsApiClient.getActiveListDetails`);
        return await this.apiRequest<PriceListDto>({ url: '/price-lists/current-data/' });
    }

    public static async getPriceListDetails(id: number): Promise<PriceListDto | undefined> {
        console.log(`PriceListsApiClient.getPriceListDetails: id - ${id}`);
        return await this.apiRequest<PriceListDto>({ url: `/price-lists/${id}/entries/` });
    }

    public static async getClosed(page: number): Promise<PriceListBundleDto | undefined> {
        console.log(`PriceListsApiClient.getClosed: page - ${page + 1}`);
        const params = { page: page + 1 };
        return this.apiRequest<PriceListBundleDto>({ url: '/price-lists/completed/', params });
    }

    public static async create(data: any): Promise<void> {
        console.log(`PriceListsApiClient.create: ${data}`);
        await this.apiRequest<void>({ url: '/price-lists/create/', data, method: 'POST' });
    }
}
