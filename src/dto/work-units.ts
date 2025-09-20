export interface WorkUnitDto {
    id: number;
    issuedDate?: Date;
    returnedDate?: Date;
    orderId?: number;
    metalIssued?: number;
    metalReturned?: number;
    loss?: number;
    metalReturnedWithLoss?: number;
}

export interface WorkUnitsReportDto {
    employeeFullName: string;
    reportMetalName: string;
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
