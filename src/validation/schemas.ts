import z from 'zod';

export const createMaterialSchema = z.object({
    name: z.string().nonempty('Це поле є обовʼязковим'),
    price: z.number({ message: 'Введіть число' }).positive('Вартість повинна бути більшою за 0'),
});

export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;

export const createEmployeeSchema = z.object({
    name: z.string().nonempty('Це поле є обовʼязковим'),
    phone: z
        .string()
        .nonempty('Це поле є обовʼязковим')
        .regex(/^\s*(\+38)?\d{10}\s*$/im, { message: 'Неправильний формат' }),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const signinSchema = z.object({
    email: z.string().nonempty('Введіть електронну адресу'),
    password: z.string().nonempty('Введіть пароль'),
});

export type SigninFormData = z.infer<typeof signinSchema>;

export const createProductSchema = z.object({
    name: z.string().nonempty('Це поле є обовʼязковим'),
    article: z.string().nonempty('Це поле є обовʼязковим'),
    pictureBase64: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

export const createCustomerSchema = z.object({
    fullName: z.string().nonempty('Це поле є обовʼязковим'),
    phone: z
        .string()
        .nonempty('Це поле є обовʼязковим')
        .regex(/^\s*(\+38)?\d{10}\s*$/im, { message: 'Неправильний формат' }),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

export const updateCustomerInfoSchema = z.object({
    fullName: z.string().nonempty('Це поле є обовʼязковим'),
    phone: z
        .string()
        .nonempty('Це поле є обовʼязковим')
        .regex(/^\s*(\+38)?\d{10}\s*$/im, { message: 'Неправильний формат' }),
});

export type UpdateCustomerInfoFromData = z.infer<typeof updateCustomerInfoSchema>;

export const orderPositionSchema = z.object({
    productId: z
        .number({ error: 'Оберіть виріб' })
        .nullish()
        .refine((val) => val !== null),
    size: z
        .number({ error: 'Введіть число' })
        .multipleOf(0.01, { error: 'Неправильний формат' })
        .nullish()
        .refine((val) => val !== null),
    count: z
        .number({ error: 'Введіть кількість виробів' })
        .int({ error: 'Введіть ціле число' })
        .nullish()
        .refine((val) => val !== null),
    notes: z.string().optional(),
});

export const createUpdateOrderSchema = z.object({
    metalId: z.number({ error: 'Оберіть матеріал' }),
    workPrice: z
        .number({ error: 'Введіть число' })
        .positive({ error: 'Вартість роботи повинна бути додатною' })
        .multipleOf(0.01, { error: 'Неправильний формат' }),
    positions: z
        .array(orderPositionSchema)
        .nonempty({ error: 'Список товарів не може бути порожнім' })
        .nonoptional({ error: 'Список товарів не може бути порожнім' }),
    executorsIds: z
        .array(z.number().positive())
        .min(1, { error: 'Оберіть хоча б одного виконавця' }),
});

export type CreateOrderFormData = z.infer<typeof createUpdateOrderSchema>;

export type UpdateOrderFormData = z.infer<typeof createUpdateOrderSchema>;

export const completeOrderSchema = z.object({
    discount: z.preprocess(
        (val) => (isNaN(Number(val)) || val === '' ? undefined : val),
        z.number({ error: 'Введіть число' }).optional().nullish(),
    ),
    loss: z
        .number('Введіть число')
        .min(0, { error: 'Відсоток угару повинен бути більшим за 0%' })
        .max(100, 'Відсоток угару повинен бути не більшим за 100%'),
    totalMetalWeight: z
        .number('Введіть число')
        .positive('Вага металу у виробах повинна бути більшою за 0'),
    payments: z.array(
        z.object({
            materialId: z.number().nullable(),
            materialCurrencyEquivalent: z
                .number('Введіть число')
                .nonnegative('Значення повинно бути невідʼємним'),
        }),
    ),
});

export type CompleteOrderFormData = z.infer<typeof completeOrderSchema>;
