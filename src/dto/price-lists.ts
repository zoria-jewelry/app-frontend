import type { Pageable } from './common.ts';

export interface PriceListEntryDto {
    materialName: string;
    materialPrice: number;
}

export interface PriceListDto {
    id: number;
    startDate: Date;
    entries: PriceListEntryDto[];
}

export interface PriceListBundleEntryDto {
    id: number;
    startDate: Date;
    endDate: Date;
}

export interface PriceListBundleDto extends Pageable<PriceListBundleEntryDto> {}
