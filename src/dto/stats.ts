export interface MaterialStatsDto {
    materialId: number | null;
    materialName: string;
    value: number;
}

export interface GlobalStatsReport {
    globalStats: MaterialStatsDto[];
    statsWithoutCustomerData: MaterialStatsDto[];
}
