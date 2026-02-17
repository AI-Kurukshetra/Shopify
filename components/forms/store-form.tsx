'use client';

import * as React from 'react';
import { createStore, type StoreFormState } from '@/app/(dashboard)/dashboard/stores/actions';
import { Alert } from '@/components/ui/alert';
import { Input, Textarea } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';

const initialState: StoreFormState = { error: null, success: false, fieldErrors: {} };

export function StoreForm() {
  const [state, formAction] = React.useActionState(createStore, initialState);

  return (
    <form className="mt-4 grid gap-4 md:grid-cols-2" action={formAction}>
      {state.error ? (
        <div className="md:col-span-2">
          <Alert variant="error" title="Unable to create store">
            {state.error}
          </Alert>
        </div>
      ) : null}
      {state.success ? (
        <div className="md:col-span-2">
          <Alert variant="success" title="Store created">
            Your store is ready. Add products to start selling.
          </Alert>
        </div>
      ) : null}
      <FormField
        label="Store name"
        htmlFor="name"
        error={state.fieldErrors?.name?.[0]}
      >
        <Input id="name" name="name" required hasError={Boolean(state.fieldErrors?.name)} />
      </FormField>
      <FormField
        label="Store slug"
        htmlFor="slug"
        hint="Used in the storefront URL."
        error={state.fieldErrors?.slug?.[0]}
      >
        <Input
          id="slug"
          name="slug"
          placeholder="acme-shop"
          required
          hasError={Boolean(state.fieldErrors?.slug)}
        />
      </FormField>
      <FormField
        label="Description"
        htmlFor="description"
        className="md:col-span-2"
        error={state.fieldErrors?.description?.[0]}
      >
        <Textarea id="description" name="description" rows={3} />
      </FormField>
      <SubmitButton className="md:col-span-2 w-full">Create store</SubmitButton>
    </form>
  );
}
