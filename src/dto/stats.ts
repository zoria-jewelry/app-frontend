export interface MaterialStatsDto {
    materialId: number | null;
    materialName: string;
    totalBalance: number;
}

export interface GlobalStatsReport {
    globalStats: MaterialStatsDto[];
    statsWithoutCustomerData: MaterialStatsDto[];
}
