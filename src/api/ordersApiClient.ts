import { AbstractApiClient } from './abstractApiClient.ts';
import {
    type CompleteOrderCalculationsDto,
    type OrderDto,
    type OrdersListDto,
    OrderStatus,
    type RequestOrderCalculationDto,
} from '../dto/orders.ts';
import type { CreateOrderFormData, UpdateOrderFormData } from '../validation/schemas.ts';

export interface OrdersFilterData {
    fromDate?: Date;
    toDate?: Date;
    statuses?: OrderStatus[];
    executorsIds?: number[];
}

export class OrdersApiClient extends AbstractApiClient {
    public static async getById(id: number): Promise<OrderDto | undefined> {
        console.log(`OrdersApiClient.getById: ${id}`);
        return await this.apiRequest<OrderDto>({ url: `/orders/${id}/` });
    }

    public static async getByCustomerId(
        customerId: number,
        phrase: string,
        filterData: OrdersFilterData | undefined,
        page: number,
    ): Promise<OrdersListDto | undefined> {
        console.log(
            `OrdersApiClient.getByCustomerId: customerId - ${customerId}, phrase - ${phrase}, filterData - ${JSON.stringify(filterData)} page - ${page}`,
        );
        const params = {
            search: phrase,
            page: page + 1,
        };
        return await this.apiRequest<OrdersListDto>({
            url: `/clients/${customerId}/orders/`,
            params,
        });
    }

    public static async getAll(
        phrase: string,
        filterData: OrdersFilterData | undefined,
        page: number,
    ): Promise<OrdersListDto | undefined> {
        console.log(
            `OrdersApiClient.getAll: ${phrase}, filterData - ${JSON.stringify(filterData)}, page - ${page}`,
        );
        const params = { search: phrase, page: page + 1 };
        return await this.apiRequest<OrdersListDto>({ url: '/orders/', params });
    }

    public static async create(data: CreateOrderFormData): Promise<void> {
        console.log(`OrdersApiClient.create: ${JSON.stringify(data)}`);
        await this.apiRequest<void>({ url: '/orders/', method: 'POST', data });
    }

    public static async change(orderId: number, data: UpdateOrderFormData): Promise<void> {
        console.log(`OrdersApiClient.change: ${JSON.stringify(data)}`);
        await this.apiRequest<void>({ url: `/orders/${orderId}/`, method: 'PATCH', data });
    }

    public static async cancelOrder(orderId: number, reason: string): Promise<void> {
        console.log(`OrdersApiClient.cancelOrder: orderId - ${orderId}, reason - ${reason}`);
        const data = { cancellationReason: reason };
        return await this.apiRequest<void>({
            url: `/orders/${orderId}/cancel/`,
            method: 'POST',
            data,
        });
    }

    public static async getCompleteOrderCalculations(
        orderId: number,
        data: RequestOrderCalculationDto,
    ): Promise<CompleteOrderCalculationsDto | undefined> {
        console.log(
            `OrdersApiClient.getCompleteOrderCalculations: orderId - ${orderId}, data - ${JSON.stringify(data)} }`,
        );
        return await this.apiRequest<CompleteOrderCalculationsDto>({
            url: `/orders/${orderId}/calculate-completion/`,
            method: 'POST',
            data,
        });
    }

    public static async getAllActiveIds(): Promise<number[] | undefined> {
        console.log('OrdersApiClient.getAllActiveIds');
        // TODO: replace with real endpoint via this.apiRequest when backend is ready
        const response = await fetch('/orders.json');
        const json = (await response.json()) as unknown as { pages: OrdersListDto[] };
        const firstPage = json.pages?.[0];
        return firstPage?.entries?.map((o) => o.id) ?? [];
        // Example real call:
        // const data = await this.apiRequest<{ ids: number[] }>({ url: '/orders/active-ids/' });
        // return data?.ids;
    }
}
