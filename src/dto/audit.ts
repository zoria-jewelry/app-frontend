export interface AuditRecordRow {
    materialName: string;
    delta: number;
    isMoney?: boolean;
}

export interface AuditRecord {
    id: number;
    time: Date;
    actorFullName: string;
    affectedCustomerId: number | null;
    affectedCustomerFullName: string | null;
    description: string;
    entryRows: AuditRecordRow[];
}

export interface CustomerAuditDetailsDto {
    entries: AuditRecord[];
}
