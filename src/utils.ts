import { OrderStatus } from './dto/orders.ts';

export const toLocalDate = (date?: string | Date | null) => {
    if (!date) {
        return null;
    }
    return new Date(date).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const toLocalDateTime = (date?: string | Date | null) => {
    if (!date) {
        return null;
    }
    return new Date(date).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });
};

export const formatDateToYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const endOfMonth = new Date(
        Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    );
    return { start: startOfMonth, end: endOfMonth };
};

export const toFixedNumber = (value: number | string | undefined, decimals: number) =>
    Number(value).toFixed(decimals);

export const orderStatusToHumanText = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.IN_PROGRESS:
            return 'У процесі';
        case OrderStatus.COMPLETED:
            return 'Виконано';
        case OrderStatus.CANCELED:
            return 'Скасовано';
    }
};

export const toUtcString = (date: Date | undefined, endOfDay = false): string | undefined => {
    if (!date) return undefined;

    const local = new Date(date);
    if (endOfDay) {
        local.setHours(23, 59, 59, 999);
    } else {
        local.setHours(0, 0, 0, 0);
    }

    return local.toISOString();
};
