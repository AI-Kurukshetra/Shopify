'use client';

import * as React from 'react';
import { createProduct, type ProductFormState } from '@/app/(dashboard)/dashboard/products/actions';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: ProductFormState = { error: null, success: false, fieldErrors: {} };

export function ProductForm({ storeId }: { storeId: string }) {
  const [state, formAction] = React.useActionState(createProduct, initialState);

  return (
    <form className="mt-4 grid gap-4 md:grid-cols-4" action={formAction}>
      <input type="hidden" name="store_id" value={storeId} />
      {state.error ? (
        <div className="md:col-span-4">
          <Alert variant="error" title="Unable to add product">
            {state.error}
          </Alert>
        </div>
      ) : null}
      {state.success ? (
        <div className="md:col-span-4">
          <Alert variant="success" title="Product added">
            Your product is now in the catalog.
          </Alert>
        </div>
      ) : null}
      <FormField
        label="Name"
        htmlFor="name"
        className="md:col-span-2"
        error={state.fieldErrors?.name?.[0]}
      >
        <Input id="name" name="name" required hasError={Boolean(state.fieldErrors?.name)} />
      </FormField>
      <FormField label="Price" htmlFor="price" error={state.fieldErrors?.price?.[0]}>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          hasError={Boolean(state.fieldErrors?.price)}
        />
      </FormField>
      <FormField label="Status" htmlFor="status">
        <select
          id="status"
          name="status"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </FormField>
      <SubmitButton className="md:col-span-4 w-full">Add product</SubmitButton>
    </form>
  );
}
