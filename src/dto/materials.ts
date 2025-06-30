import type { Pageable } from './common.ts';

export interface MaterialDto {
    id: number;
    name: string;
    price: number;
}

export interface MaterialsListDto extends Pageable<MaterialDto> {}
