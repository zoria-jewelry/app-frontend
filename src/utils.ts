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
