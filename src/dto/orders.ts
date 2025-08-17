import type { Pageable } from './common.ts';

export enum OrderStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

export interface OrderBriefInfoEntryDto {
    productId: number;
    productName: string;
    count: number;
}

export interface OrderBriefInfoDto {
    id: number;
    creationDate: Date;
    completionDate: Date | null;
    status: OrderStatus;
    entries: OrderBriefInfoEntryDto[];
}

export interface OrdersListDto extends Pageable<OrderBriefInfoDto> {}
