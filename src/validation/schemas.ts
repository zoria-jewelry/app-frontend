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
        .multipleOf(0.01, { error: 'Крок значення — 0.01' })
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
        .multipleOf(0.01, { error: 'Крок значення — 0.01' }),
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
        .positive('Вага металу у виробах повинна бути більшою за 0')
        .multipleOf(0.001, { error: 'Крок значення — 0.001' }),
    payments: z.array(
        z.object({
            materialId: z.number().nullable(),
            materialCurrencyEquivalent: z
                .number('Введіть число')
                .nonnegative('Значення повинно бути невідʼємним')
                .multipleOf(0.01, { error: 'Крок значення — 0.01' }),
        }),
    ),
});

export type CompleteOrderFormData = z.infer<typeof completeOrderSchema>;

export const workUnitsFilterSchema = z
    .object({
        employeeId: z
            .number({ error: 'Оберіть працівника' })
            .positive({ error: 'Оберіть працівника' }),
        startDate: z
            .date({ error: "Дата початку обов'язкова" })
            .nonoptional({ error: "Дата початку обов'язкова" }),
        endDate: z
            .date({ error: "Дата кінця обов'язкова" })
            .nonoptional({ error: "Дата початку обов'язкова" }),
        metalId: z.number({ error: 'Оберіть метал' }).positive({ error: 'Оберіть метал' }),
        orderId: z.number().positive().optional(),
    })
    .refine((data) => data.startDate <= data.endDate, {
        message: 'Дата кінця не може бути раніше дати початку',
        path: ['endDate'],
    });

export type WorkUnitsFilterFormData = z.infer<typeof workUnitsFilterSchema>;

export const createWorkUnitSchema = z.object({
    employeeId: z.number({ error: 'Оберіть працівника' }).positive({ error: 'Оберіть працівника' }),
    orderId: z.number().positive().optional(),
    metalId: z.number({ error: 'Оберіть метал' }).positive({ error: 'Оберіть метал' }),
    weight: z
        .number({ error: 'Введіть число' })
        .positive('Вага повинна бути додатним числом')
        .multipleOf(0.001, { message: 'Крок значення — 0.001' }),
});

export type CreateWorkUnitFormData = z.infer<typeof createWorkUnitSchema>;

export const returnWorkUnitSchema = z.object({
    workUnitId: z.number({ error: 'Введіть число' }).positive({ error: 'Введіть додатне число' }),
    metalWeight: z
        .number({ error: 'Введіть число' })
        .nonnegative({ error: 'Введіть невідʼємне число' })
        .multipleOf(0.001, { message: 'Крок значення — 0.001' }),
    loss: z
        .number({ error: 'Введіть число' })
        .min(0, { error: 'Значення не може бути меншим за 0' })
        .max(100, { error: 'Значення повинно бути менше 100' })
        .multipleOf(0.01, { message: 'Крок значення — 0.01' }),
});

export type ReturnWorkUnitFormData = z.infer<typeof returnWorkUnitSchema>;

export const saveMetalSchema = z.object({
    metalWeight: z
        .number({ error: 'Введіть число' })
        .positive({ error: 'Введіть невідʼємне число' })
        .multipleOf(0.001, { message: 'Крок значення — 0.001' }),
});

export type SaveMetalFormData = z.infer<typeof saveMetalSchema>;
