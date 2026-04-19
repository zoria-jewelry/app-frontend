import { TextField, type TextFieldProps } from '@mui/material';
import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { useMemo, type MutableRefObject, type Ref } from 'react';
import { FORM_HELPER_TEXT_ALIGNED_SX } from '../../constants/createModalLayout.ts';

export type RhfNumberTextFieldProps<T extends FieldValues> = Omit<
    TextFieldProps,
    'name' | 'defaultValue' | 'value' | 'onChange' | 'error' | 'type'
> & {
    name: FieldPath<T>;
    control: Control<T>;
    /**
     * Value applied when the field is left empty on blur.
     * Omit for `undefined`; use `null` for nullable fields; pass `0` when the form expects zero.
     */
    emptyBlurFallback?: number | null;
};

/** Normalize RHF values (number, string from API, empty) for display and comparisons. */
function coerceNumber(v: unknown): number | undefined {
    if (v === undefined || v === null || v === '') {
        return undefined;
    }
    if (typeof v === 'number') {
        return Number.isNaN(v) ? undefined : v;
    }
    if (typeof v === 'string') {
        const t = v.trim();
        if (t === '' || t === '-') {
            return undefined;
        }
        const n = Number(t);
        return Number.isNaN(n) ? undefined : n;
    }
    return undefined;
}

/**
 * Number input that hides a default `0` until the field has been touched.
 * Coerces string values (e.g. `"0"`) so behaviour matches Complete Order and modal `reset()` flows.
 */
export function RhfNumberTextField<T extends FieldValues>({
    name,
    control,
    emptyBlurFallback,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    helperText,
    slotProps: slotPropsProp,
    inputRef: inputRefProp,
    ...textFieldProps
}: RhfNumberTextFieldProps<T>) {
    const { field, fieldState } = useController({ name, control });

    const n = coerceNumber(field.value);

    /** Hide literal zero until the field has been touched — `isDirty` alone is unreliable after `reset()` in dialogs. */
    const showEmptyInsteadOfZero = n === 0 && !fieldState.isTouched;

    const display = useMemo(() => {
        if (n === undefined) {
            return '';
        }
        if (showEmptyInsteadOfZero) {
            return '';
        }
        return n;
    }, [n, showEmptyInsteadOfZero]);

    const mergedSlotProps = useMemo(() => {
        const user = slotPropsProp ?? {};
        const userFht = user.formHelperText;
        const userSx =
            userFht && typeof userFht === 'object' && 'sx' in userFht ? userFht.sx : undefined;
        return {
            ...user,
            formHelperText: {
                ...(typeof userFht === 'object' && userFht !== null ? userFht : {}),
                sx: [
                    FORM_HELPER_TEXT_ALIGNED_SX,
                    ...(userSx !== undefined
                        ? Array.isArray(userSx)
                            ? userSx
                            : [userSx]
                        : []),
                ],
            },
        } satisfies TextFieldProps['slotProps'];
    }, [slotPropsProp]);

    return (
        <TextField
            {...textFieldProps}
            type="number"
            name={field.name}
            inputRef={mergeRefs(field.ref, inputRefProp)}
            slotProps={mergedSlotProps}
            value={display}
            onChange={(e) => {
                const raw = e.target.value;
                if (raw === '' || raw === '-') {
                    field.onChange(undefined);
                    return;
                }
                const parsed = Number(raw);
                field.onChange(Number.isNaN(parsed) ? undefined : parsed);
            }}
            onFocus={(e) => {
                if (coerceNumber(field.value) === 0) {
                    field.onChange(undefined);
                }
                onFocusProp?.(e);
            }}
            onBlur={(e) => {
                if (e.target.value === '') {
                    field.onChange(emptyBlurFallback as number | null | undefined);
                }
                field.onBlur();
                onBlurProp?.(e);
            }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? helperText}
        />
    );
}

function mergeRefs<T>(
    a: Ref<T> | undefined,
    b: Ref<T> | undefined,
): Ref<T> | undefined {
    if (!a) {
        return b;
    }
    if (!b) {
        return a;
    }
    return (node: T | null) => {
        applyRef(a, node);
        applyRef(b, node);
    };
}

function applyRef<T>(ref: Ref<T> | undefined, node: T | null) {
    if (!ref) {
        return;
    }
    if (typeof ref === 'function') {
        ref(node);
    } else {
        (ref as MutableRefObject<T | null>).current = node;
    }
}
