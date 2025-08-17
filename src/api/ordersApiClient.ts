import { AbstractApiClient } from './abstractApiClient.ts';
import type { OrdersListDto } from '../dto/orders.ts';

export class OrdersApiClient extends AbstractApiClient {
    public static async getByCustomerId(
        customerId: number,
        page: number,
    ): Promise<OrdersListDto | undefined> {
        console.log(`OrdersApiClient.getByCustomerId: customerId - ${customerId}, page - ${page}`);
        const response = await fetch('/orders.json');
        const json = (await response.json()) as unknown as { pages: OrdersListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: OrdersListDto[] }>({});
        // return res?.pages[page];
    }
}
