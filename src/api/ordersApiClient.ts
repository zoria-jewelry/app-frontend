import { AbstractApiClient } from './abstractApiClient.ts';
import { type OrdersListDto, OrderStatus } from '../dto/orders.ts';

export interface OrdersFilterData {
    fromDate?: Date;
    toDate?: Date;
    statuses?: OrderStatus[];
    executorsIds?: number[];
}

export class OrdersApiClient extends AbstractApiClient {
    public static async getByCustomerId(
        customerId: number,
        phrase: string,
        filterData: OrdersFilterData | undefined,
        page: number,
    ): Promise<OrdersListDto | undefined> {
        console.log(
            `OrdersApiClient.getByCustomerId: customerId - ${customerId}, phrase - ${phrase}, filterData - ${JSON.stringify(filterData)} page - ${page}`,
        );
        const response = await fetch('/orders.json');
        const json = (await response.json()) as unknown as { pages: OrdersListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: OrdersListDto[] }>({});
        // return res?.pages[page];
    }

    public static async cancelOrder(orderId: number): Promise<void> {
        console.log(`OrdersApiClient.cancelOrder: orderId - ${orderId}`);
        // TODO: use me - const res = await this.apiRequest<void>({});
    }
}
