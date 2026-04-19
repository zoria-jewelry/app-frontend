export interface WorkUnitDto {
    id: number;
    issuedDate?: Date;
    returnedDate?: Date;
    orderId?: number;
    metalIssued?: number;
    metalReturned?: number;
    loss?: number;
    metalReturnedWithLoss?: number;
    materialName: string;
    description?: string;
}

/** Query params for work-units report (sidebar filters on «Наряди»). */
export interface WorkUnitsFilterData {
    employeeId?: number;
    /** Display name for the selected employee (from filter UI). */
    employeeFullName?: string;
    periodStart?: Date;
    periodEnd?: Date;
    materialId?: number;
    orderId?: number;
}

export interface WorkUnitsReportDto {
    employeeFullName: string;
    periodStart: Date;
    periodEnd: Date;
    totalIssued: number;
    totalReturned: number;
    totalReturnedWithLoss: number;
    lost: number;
    savedByEmployee?: number;
    delta: number;
    spentOnOrders: number;
    entries: WorkUnitDto[];
}
