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
    openedAt: Date;
    closedAt: Date | null;
    status: OrderStatus;
    cancellationReason?: string;
    entries: OrderBriefInfoEntryDto[];
}

export interface OrdersListDto extends Pageable<OrderBriefInfoDto> {}

export interface OrderEntryDto {
    productId: number;
    productName: string;
    productArticle: string;
    productPictureUrl?: string;
    size: number;
    count: number;
    notes?: string | null;
}

export interface OrderDto {
    id: number;
    openedAt: Date;
    closedAt?: Date | null;
    status: OrderStatus;
    cancellationReason?: string;
    entries: OrderEntryDto[];
    materialName: string;
    materialPrice: number;
    materialId: number;

    executors: string[];
    executorsIds: number[];

    loss?: number; // угар
    workPrice: number; // ціна обробки граму металу
    totalWeight?: number; // загальна вага виробів (з камінням)
    totalMetalWeight?: number; // загальна вага виробів (без каміння)
    metalWeightWithLoss?: number; // totalMetalWeight * ((100% + loss) / 100)
    metalWorkPrice?: number; // metalWeightWithLoss * workPrice
    totalMetalPrice?: number; // totalMetalWeight * ціна_металу_за_грам
    stonesPrice: number;

    discount?: number | null;
    total?: number | null; // сума без знижки
    totalWithDiscount?: number | null; // сума зі знижкою
}

export interface CompleteOrderCalculationsEntryDto {
    materialId?: number;
    materialName: string;
    materialPrice: number;
    materialCountOwnedByCustomer: number;
    totalMaterialCost: number;
}

export interface CompleteOrderCalculationsDto {
    allMaterialsCost: number;
    clientIsAbleToFullyPay: boolean;
    entries: CompleteOrderCalculationsEntryDto[];
}
