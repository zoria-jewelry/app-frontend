export interface MaterialStatsDto {
    materialId: number | null;
    materialName: string;
    totalBalance: number;
    totalDebt?: number;
}

export interface GlobalStatsReport {
    globalStats: MaterialStatsDto[];
    statsWithoutCustomerData: MaterialStatsDto[];
    employeesStats: MaterialStatsDto[];
}
