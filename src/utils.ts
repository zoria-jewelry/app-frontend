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

export const toFixedNumber = (value: number | string, decimals: number) =>
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
