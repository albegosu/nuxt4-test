# Forms & Validation

## Purpose

Create reusable form components with validation using VeeValidate and Zod. This provides consistent form handling, error display, and validation across the application.

## Dependencies

- Nuxt 4 project
- Vue 3 composition API understanding

## Step-by-Step Setup

### Step 1: Install Validation Libraries

Install VeeValidate and Zod:

```bash
npm install vee-validate @vee-validate/zod zod
```

### Step 2: Create Base Form Input Component

Create `components/forms/FormInput.vue`:

```vue
<template>
  <div class="form-group">
    <label v-if="label" :for="name">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
      :class="{ 'error': error }"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-if="hint && !error" class="hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  label?: string
  type?: string
  value?: string | number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:value', value: string | number): void
  (e: 'blur'): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.required {
  color: red;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

input.error {
  border-color: red;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  display: block;
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.hint {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
```

### Step 3: Create Form Wrapper with VeeValidate

Create `components/forms/Form.vue`:

```vue
<template>
  <form @submit.prevent="handleSubmit" class="form">
    <slot :errors="errors" :values="values" />
    
    <div v-if="submitError" class="submit-error">
      {{ submitError }}
    </div>
    
    <div class="form-actions">
      <button 
        type="submit" 
        :disabled="isSubmitting || !isValid"
        class="submit-button"
      >
        {{ isSubmitting ? submittingText : submitText }}
      </button>
      
      <button 
        v-if="showCancel"
        type="button" 
        @click="$emit('cancel')"
        class="cancel-button"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { ZodSchema } from 'zod'

interface Props {
  schema: ZodSchema
  submitText?: string
  submittingText?: string
  showCancel?: boolean
  initialValues?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  submitText: 'Submit',
  submittingText: 'Submitting...',
  showCancel: false,
})

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void
  (e: 'cancel'): void
}>()

const { handleSubmit, errors, values, isValid, isSubmitting } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues,
})

const submitError = ref('')

const handleFormSubmit = handleSubmit(async (values) => {
  submitError.value = ''
  try {
    await emit('submit', values)
  } catch (error: any) {
    submitError.value = error.message || 'Submission failed'
  }
})
</script>

<style scoped>
.form {
  max-width: 600px;
}

.submit-error {
  color: red;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fee;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-button,
.cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.submit-button {
  background-color: #007bff;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}
</style>
```

### Step 4: Create Validated Form Input

Create `components/forms/ValidatedInput.vue`:

```vue
<template>
  <FormInput
    :name="name"
    :label="label"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :error="errorMessage"
    :hint="hint"
    @update:value="handleUpdate"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'

interface Props {
  name: string
  label?: string
  type?: string
  modelValue?: string | number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const { value, errorMessage, handleBlur: fieldBlur } = useField(() => props.name)

// Sync with parent
watch(() => props.modelValue, (newVal) => {
  value.value = newVal
}, { immediate: true })

watch(value, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleUpdate = (val: string | number) => {
  value.value = val
}

const handleBlur = () => {
  fieldBlur()
}
</script>
```

### Step 5: Create Validation Schemas

Create `utils/validation.ts`:

```typescript
import { z } from 'zod'

// Email validation
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Password validation
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

// Company setup validation
export const companySetupSchema = z.object({
  cif: z
    .string()
    .min(1, 'CIF is required')
    .regex(/^[A-Z]?[0-9]{8}[A-Z0-9]$/, 'Invalid CIF format'),
  name: z.string().min(1, 'Company name is required').max(200),
})

// User registration
export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

// Sign in
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

### Step 6: Example Usage

Use in a page:

```vue
<template>
  <Form
    :schema="signUpSchema"
    submit-text="Sign Up"
    @submit="handleSignUp"
  >
    <template #default="{ errors }">
      <ValidatedInput
        name="name"
        label="Name"
        v-model="form.name"
      />
      
      <ValidatedInput
        name="email"
        label="Email"
        type="email"
        v-model="form.email"
      />
      
      <ValidatedInput
        name="password"
        label="Password"
        type="password"
        v-model="form.password"
        hint="At least 8 characters with uppercase, lowercase, and number"
      />
    </template>
  </Form>
</template>

<script setup lang="ts">
import { signUpSchema } from '~/utils/validation'

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const handleSignUp = async (values: any) => {
  // values are already validated
  const { signUp } = useAuth()
  await signUp(values.email, values.password, values.name)
}
</script>
```

## Configuration

### Validation Rules

Common Zod validators:
- `.string()` - String type
- `.email()` - Email format
- `.min(n)` - Minimum length/value
- `.max(n)` - Maximum length/value
- `.regex()` - Pattern matching
- `.refine()` - Custom validation

### Custom Validation

```typescript
const customSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

## Key Files

- `components/forms/Form.vue` - Form wrapper with validation
- `components/forms/FormInput.vue` - Base input component
- `components/forms/ValidatedInput.vue` - Validated input component
- `utils/validation.ts` - Validation schemas

## Notes & Gotchas

- **VeeValidate**: Provides form state management and validation
- **Zod**: Provides schema definition and runtime validation
- **Type Safety**: Zod schemas provide TypeScript types
- **Error Messages**: Customize error messages in Zod schemas
- **Async Validation**: Use `.refine()` with async functions for server-side validation

## Next Steps

- [Editable Tables](editable-tables.md) - Create table components
- [Charting](charting.md) - Add charting capabilities
