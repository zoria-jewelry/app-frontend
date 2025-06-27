export interface AbstractResponseDto<T> {
    payload: T;
}

export interface Pageable<T> {
    entries: Array<T>;
    total: number;
    page: number;
    perPage: number;
}

export interface MaterialDto {
    id: number;
    name: string;
    price: number;
}

export interface MaterialsListDto extends Pageable<MaterialDto> {}
