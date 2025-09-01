export interface Pageable<T> {
    entries: Array<T>;
    total: number;
    page: number;
}
