import type { Pageable } from './common.ts';

export interface CustomerDto {
    id: number;
    fullName: string;
    phone: string;
    activeOrders: boolean;
}

export interface CustomerListDto extends Pageable<CustomerDto> {}
