export interface WorkUnitDto {
    issuedDate: Date;
    metalIssued: number;
    orderId?: number;
    returnedDate?: Date;
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
    spentOnOrders: number;
    entries: WorkUnitDto[];
}
