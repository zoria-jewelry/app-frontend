export const toLocalDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
