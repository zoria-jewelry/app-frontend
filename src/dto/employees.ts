import type { Pageable } from './common.ts';

export interface EmployeeDto {
    id: number;
    name: string;
    phone: string;
    isArchived: boolean;
}

export interface EmployeesListDto extends Pageable<EmployeeDto> {}
