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
    creationDate: Date;
    completionDate?: Date | null;
    status: OrderStatus;
    cancellationReason?: string;
    entries: OrderEntryDto[];
    materialName: string;

    executors: string[];

    loss?: number; // угар
    workPrice: number; // ціна обробки граму металу
    totalWeight?: number; // загальна вага виробів (з камінням)
    totalMetalWeight?: number; // загальна вага виробів (без каміння)
    metalWeightWithLoss?: number; // totalMetalWeight * ((100% + loss) / 100)
    metalWorkPrice?: number; // metalWeightWithLoss * workPrice
    totalMetalPrice?: number; // totalMetalWeight * ціна_металу_за_грам

    discount?: number | null;
    subtotal?: number | null; // сума без знижки
    total?: number | null; // сума зі знижкою
}
