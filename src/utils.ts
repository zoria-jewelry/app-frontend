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

export const toFixedNumber = (value: number, decimals: number) =>
    (Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals);

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
