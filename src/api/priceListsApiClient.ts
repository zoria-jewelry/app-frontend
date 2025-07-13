import { AbstractApiClient } from './abstractApiClient.ts';
import type { PriceListBundleDto, PriceListDto } from '../dto/price-lists.ts';

export class PriceListsApiClient extends AbstractApiClient {
    public static async getActiveListDetails(): Promise<PriceListDto | undefined> {
        console.log(`PriceListsApiClient.getActiveListDetails`);
        const response = await fetch('/price-list-details.json');
        return (await response.json()) as PriceListDto;
        // TODO: use me - const res = await this.apiRequest<{ pages: PriceListDto[] }>({});
        // return res?.pages[page];
    }

    public static async getPriceListDetails(id: number): Promise<PriceListDto | undefined> {
        console.log(`PriceListsApiClient.getPriceListDetails: id - ${id}`);
        const response = await fetch('/price-list-details.json');
        return (await response.json()) as PriceListDto;
        // TODO: use me - const res = await this.apiRequest<{ pages: PriceListDto[] }>({});
        // return res?.pages[page];
    }

    public static async getClosed(page: number): Promise<PriceListBundleDto | undefined> {
        console.log(`PriceListsApiClient.getClosed: page - ${page}`);
        const response = await fetch('/price-lists-bundle.json');
        const json = (await response.json()) as unknown as { pages: PriceListBundleDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: PriceListBundleDto[] }>({});
        // return res?.pages[page];
    }
}
