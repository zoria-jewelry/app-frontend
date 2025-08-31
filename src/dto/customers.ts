import type { Pageable } from './common.ts';

export interface CustomerDto {
    id: number;
    fullName: string;
    phone: string;
    activeOrders: number;
}

export interface CustomerListDto extends Pageable<CustomerDto> {}

export interface CustomerBalanceEntryDto {
    materialId: number;
    materialName: string;
    value: number;
}

export interface CustomerBalanceDto {
    entries: CustomerBalanceEntryDto[];
}
