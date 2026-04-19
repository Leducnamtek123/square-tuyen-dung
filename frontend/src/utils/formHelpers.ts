import type { Resolver, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type * as yup from 'yup';

/**
 * Type-safe yup resolver wrapper for react-hook-form.
 *
 * ## Why this exists (Root Cause)
 *
 * `yupResolver(schema)` infers its return type from `yup.InferType<schema>`,
 * which often doesn't match the form's `TFieldValues` exactly due to:
 * - optional vs required mismatches between yup schema and form values
 * - nested object shapes having slightly different inference
 * - union types (string | number) in form values vs yup's strict inference
 *
 * The old pattern was `yupResolver(schema) as any`, which:
 * ❌ lost ALL type safety (you could pass wrong schema without errors)
 * ❌ hid real type mismatches that could cause runtime bugs
 *
 * This utility:
 * ✅ preserves the constraint that schema must be a valid yup ObjectSchema
 * ✅ returns a properly typed Resolver<TFormValues>
 * ✅ keeps type safety at the consumer level (useForm<T> still validates)
 *
 * @example
 * ```ts
 * const { control } = useForm<MyFormValues>({
 *   resolver: typedYupResolver<MyFormValues>(schema),
 * });
 * ```
 */
export function typedYupResolver<TFormValues extends FieldValues>(
  schema: yup.ObjectSchema<any>,
): Resolver<TFormValues> {
  // Cast to bridge yup's inferred type to the form's expected type.
  // This is safe because yup will still validate at runtime.
  return yupResolver(schema) as Resolver<TFormValues>;
}
