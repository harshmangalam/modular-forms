import { batch } from '@preact/signals-react';
import type {
  FieldValues,
  ResponseData,
  FormStore,
  FieldPath,
  FieldArrayPath,
  Maybe,
} from '../types';
import { getFieldArrayStore, getFieldStore, updateFormInvalid } from '../utils';
import { focus } from './focus';

/**
 * Value type of the set error options.
 */
export type SetErrorOptions = Partial<{
  shouldActive: boolean;
  shouldTouched: boolean;
  shouldDirty: boolean;
  shouldFocus: boolean;
}>;

/**
 * Sets the error of the specified field or field array.
 *
 * @param form The form of the field.
 * @param name The name of the field.
 * @param error The error message.
 * @param options The error options.
 */
export function setError<
  TFieldValues extends FieldValues,
  TResponseData extends ResponseData
>(
  form: FormStore<TFieldValues, TResponseData>,
  name: FieldPath<TFieldValues> | FieldArrayPath<TFieldValues>,
  error: string,
  {
    shouldActive = true,
    shouldTouched = false,
    shouldDirty = false,
    shouldFocus = !!error,
  }: Maybe<SetErrorOptions> = {}
): void {
  batch(() => {
    for (const fieldOrFieldArray of [
      getFieldStore(form, name as FieldPath<TFieldValues>),
      getFieldArrayStore(form, name as FieldArrayPath<TFieldValues>),
    ]) {
      if (
        fieldOrFieldArray &&
        (!shouldActive || fieldOrFieldArray.active.peek()) &&
        (!shouldTouched || fieldOrFieldArray.touched.peek()) &&
        (!shouldDirty || fieldOrFieldArray.dirty.peek())
      ) {
        // Set error to field or field array
        fieldOrFieldArray.error.value = error;

        // Focus element if set to "true"
        if (error && 'value' in fieldOrFieldArray && shouldFocus) {
          focus(form, name as FieldPath<TFieldValues>);
        }
      }
    }

    // Update invalid state of form
    updateFormInvalid(form, !!error);
  });
}
