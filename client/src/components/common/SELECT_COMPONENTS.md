# Select Components

Standardized select and lookup components for forms, reducing boilerplate code and ensuring consistent UX.

## Overview

These components provide:
- **Reduced boilerplate** - No need to repeatedly fetch data, handle loading, or map options
- **Consistent UX** - All selects look and behave the same across the app
- **React Hook Form integration** - Works seamlessly with Controller
- **React Query integration** - Automatic caching and background updates
- **Type safety** - Full TypeScript support with generics

## Components

### 1. LookupSelect

Autocomplete component for selecting entities from the API (users, roles, consumers, etc.).

**Features:**
- Fetches options from API with React Query
- Automatic loading and error states
- Search/filter functionality
- Single or multiple selection
- Caching with React Query
- Responsive data structure handling

**Basic Usage:**

```typescript
import { LookupSelect, LookupOption } from '@/components/common';
import { Controller } from 'react-hook-form';
import { usersApi } from '@/services/api';

// Define your option type
interface UserOption extends LookupOption {
  email: string;
  phone: string;
}

// In your form component
<Controller
  name="user_id"
  control={control}
  render={({ field, fieldState }) => (
    <LookupSelect<UserOption>
      label="Select User"
      value={selectedUser}
      onChange={(value) => {
        field.onChange(value?.id); // Store ID in form
        setSelectedUser(value);    // Keep full object for display
      }}
      fetchOptions={() => usersApi.getAll()}
      queryKey={['users']}
      mapOption={(user) => ({
        id: user.id,
        label: user.full_name,
        email: user.email,
        phone: user.phone,
      })}
      required
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
```

**Multiple Selection:**

```typescript
<LookupSelect<RoleOption>
  label="Assign Roles"
  value={selectedRoles}
  onChange={setSelectedRoles}
  fetchOptions={() => rolesApi.getAll()}
  queryKey={['roles']}
  mapOption={(role) => ({
    id: role.id,
    label: role.display_name,
    description: role.description,
  })}
  multiple
  limitTags={3}
  placeholder="Select one or more roles"
/>
```

**With Custom Filtering:**

```typescript
<LookupSelect
  label="Select Active User"
  value={user}
  onChange={setUser}
  fetchOptions={() => usersApi.getAll({ is_active: true })}
  queryKey={['users', 'active']}
  mapOption={(user) => ({
    id: user.id,
    label: `${user.full_name} (${user.employee_id})`,
  })}
  filterOptions={(options, inputValue) => {
    const lower = inputValue.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lower) ||
      opt.employee_id?.toLowerCase().includes(lower)
    );
  }}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `value` | `T \| T[] \| null` | required | Current value(s) |
| `onChange` | `(value) => void` | required | Change handler |
| `fetchOptions` | `() => Promise<...>` | required | Function to fetch options |
| `queryKey` | `string[]` | required | React Query cache key |
| `mapOption` | `(item) => T` | required | Map API item to LookupOption |
| `multiple` | `boolean` | `false` | Allow multiple selection |
| `placeholder` | `string` | - | Placeholder text |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `boolean` | `false` | Error state |
| `helperText` | `string` | - | Helper or error text |
| `limitTags` | `number` | `2` | Max tags shown (multiple mode) |
| `freeSolo` | `boolean` | `false` | Allow free text input |
| `loadingText` | `string` | `'Loading...'` | Loading message |
| `noOptionsText` | `string` | `'No options'` | Empty message |
| `onInputChange` | `(value) => void` | - | Search text change callback |
| `filterOptions` | `(options, input) => T[]` | default | Custom filter function |

### 2. StatusSelect

Simple select component for predefined options (status, priority, enums).

**Features:**
- No API calls (static options)
- Handles boolean, string, and number values
- Works with react-hook-form
- Simple and lightweight

**Basic Usage:**

```typescript
import { StatusSelect, StatusOption } from '@/components/common';
import { Controller } from 'react-hook-form';

// Define your options
const STATUS_OPTIONS: StatusOption[] = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' },
];

// In your form component
<Controller
  name="is_active"
  control={control}
  render={({ field, fieldState }) => (
    <StatusSelect
      label="Status"
      value={field.value}
      onChange={field.onChange}
      options={STATUS_OPTIONS}
      required
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  )}
/>
```

**Priority Select:**

```typescript
const PRIORITY_OPTIONS: StatusOption[] = [
  { value: 1, label: 'Low', color: 'info' },
  { value: 2, label: 'Medium', color: 'warning' },
  { value: 3, label: 'High', color: 'error' },
];

<StatusSelect
  label="Priority"
  value={priority}
  onChange={setPriority}
  options={PRIORITY_OPTIONS}
/>
```

**String Enum:**

```typescript
const OPTING_STATUS_OPTIONS: StatusOption[] = [
  { value: 'OPT_IN', label: 'Opt In' },
  { value: 'OPT_OUT', label: 'Opt Out' },
  { value: 'PENDING', label: 'Pending' },
];

<StatusSelect
  label="Opting Status"
  value={optingStatus}
  onChange={setOptingStatus}
  options={OPTING_STATUS_OPTIONS}
  placeholder="Choose status..."
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `value` | `string \| number \| boolean` | required | Current value |
| `onChange` | `(value) => void` | required | Change handler |
| `options` | `StatusOption[]` | required | Available options |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `boolean` | `false` | Error state |
| `helperText` | `string` | - | Helper or error text |
| `fullWidth` | `boolean` | `true` | Full width |
| `placeholder` | `string` | - | Placeholder text |

## Usage Patterns

### 1. Form with LookupSelect (Foreign Key Selection)

```typescript
import { useForm, Controller } from 'react-hook-form';
import { LookupSelect, LookupOption } from '@/components/common';

interface DeliveryFormValues {
  consumer_id: number;
  delivery_person_id: number;
  route_id: number;
  status: string;
}

interface ConsumerOption extends LookupOption {
  phone: string;
  address: string;
}

function DeliveryForm() {
  const { control, handleSubmit } = useForm<DeliveryFormValues>();
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerOption | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="consumer_id"
            control={control}
            rules={{ required: 'Consumer is required' }}
            render={({ field, fieldState }) => (
              <LookupSelect<ConsumerOption>
                label="Consumer"
                value={selectedConsumer}
                onChange={(value) => {
                  field.onChange(value?.id);
                  setSelectedConsumer(value);
                }}
                fetchOptions={() => consumersApi.getAll()}
                queryKey={['consumers']}
                mapOption={(consumer) => ({
                  id: consumer.id,
                  label: consumer.consumer_name,
                  phone: consumer.phone_number,
                  address: consumer.address,
                })}
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="delivery_person_id"
            control={control}
            rules={{ required: 'Delivery person is required' }}
            render={({ field, fieldState }) => (
              <LookupSelect
                label="Delivery Person"
                value={selectedDeliveryPerson}
                onChange={(value) => {
                  field.onChange(value?.id);
                  setSelectedDeliveryPerson(value);
                }}
                fetchOptions={() => deliveryPersonsApi.getAll()}
                queryKey={['delivery-persons']}
                mapOption={(dp) => ({
                  id: dp.id,
                  label: `${dp.name} - ${dp.area}`,
                })}
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <StatusSelect
                label="Delivery Status"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'DELIVERED', label: 'Delivered' },
                  { value: 'FAILED', label: 'Failed' },
                ]}
              />
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
}
```

### 2. Filter Form with Multiple Selection

```typescript
function ConsumerFilters() {
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [status, setStatus] = useState('');

  return (
    <Box>
      <LookupSelect
        label="Filter by Routes"
        value={selectedRoutes}
        onChange={setSelectedRoutes}
        fetchOptions={() => routesApi.getAll()}
        queryKey={['routes']}
        mapOption={(route) => ({
          id: route.id,
          label: `${route.route_name} - ${route.area}`,
        })}
        multiple
        limitTags={2}
        placeholder="All routes"
      />

      <StatusSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: '', label: 'All' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ]}
      />
    </Box>
  );
}
```

### 3. Dependent Selects (Cascading)

```typescript
function AddressForm() {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <>
      <Controller
        name="state_id"
        control={control}
        render={({ field }) => (
          <LookupSelect
            label="State"
            value={selectedState}
            onChange={(value) => {
              field.onChange(value?.id);
              setSelectedState(value);
              setSelectedCity(null); // Reset city when state changes
            }}
            fetchOptions={() => statesApi.getAll()}
            queryKey={['states']}
            mapOption={(state) => ({
              id: state.id,
              label: state.name,
            })}
            required
          />
        )}
      />

      <Controller
        name="city_id"
        control={control}
        render={({ field }) => (
          <LookupSelect
            label="City"
            value={selectedCity}
            onChange={(value) => {
              field.onChange(value?.id);
              setSelectedCity(value);
            }}
            fetchOptions={() => citiesApi.getByState(selectedState?.id)}
            queryKey={['cities', selectedState?.id]}
            mapOption={(city) => ({
              id: city.id,
              label: city.name,
            })}
            disabled={!selectedState}
            required
          />
        )}
      />
    </>
  );
}
```

### 4. Edit Mode (Pre-populate from API)

```typescript
function EditUserForm({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId),
  });

  const { control, reset } = useForm();
  const [selectedRole, setSelectedRole] = useState(null);

  // Pre-populate form when data loads
  useEffect(() => {
    if (user?.data) {
      reset({
        full_name: user.data.full_name,
        email: user.data.email,
        role_id: user.data.role?.id,
      });

      // Set the full role object for LookupSelect
      if (user.data.role) {
        setSelectedRole({
          id: user.data.role.id,
          label: user.data.role.display_name,
        });
      }
    }
  }, [user, reset]);

  return (
    <Controller
      name="role_id"
      control={control}
      render={({ field }) => (
        <LookupSelect
          label="Role"
          value={selectedRole}
          onChange={(value) => {
            field.onChange(value?.id);
            setSelectedRole(value);
          }}
          fetchOptions={() => rolesApi.getAll()}
          queryKey={['roles']}
          mapOption={(role) => ({
            id: role.id,
            label: role.display_name,
          })}
        />
      )}
    />
  );
}
```

## Migration from Manual Selects

### Before (Manual Pattern):

```typescript
// UserForm.tsx - BEFORE
const [roles, setRoles] = useState([]);
const [loadingRoles, setLoadingRoles] = useState(false);

useEffect(() => {
  setLoadingRoles(true);
  rolesApi.getAll()
    .then((response) => {
      setRoles(response.data.results || []);
    })
    .catch((error) => {
      toast.error('Failed to load roles');
    })
    .finally(() => {
      setLoadingRoles(false);
    });
}, []);

<Controller
  name="role_id"
  control={control}
  render={({ field }) => (
    <Autocomplete
      options={roles}
      getOptionLabel={(option) => option.display_name}
      value={roles.find((r) => r.id === field.value) || null}
      onChange={(_, value) => field.onChange(value?.id)}
      loading={loadingRoles}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Role"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loadingRoles ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )}
/>
```

### After (With LookupSelect):

```typescript
// UserForm.tsx - AFTER
const [selectedRole, setSelectedRole] = useState(null);

<Controller
  name="role_id"
  control={control}
  render={({ field }) => (
    <LookupSelect
      label="Role"
      value={selectedRole}
      onChange={(value) => {
        field.onChange(value?.id);
        setSelectedRole(value);
      }}
      fetchOptions={() => rolesApi.getAll()}
      queryKey={['roles']}
      mapOption={(role) => ({
        id: role.id,
        label: role.display_name,
      })}
    />
  )}
/>
```

**Benefits:**
- ✅ 40+ lines reduced to ~15 lines
- ✅ No manual loading state management
- ✅ No manual error handling
- ✅ Automatic caching with React Query
- ✅ Consistent UX across all forms

## Best Practices

### 1. When to Use LookupSelect vs StatusSelect

**Use LookupSelect when:**
- Selecting from dynamic data (users, roles, products, etc.)
- Data comes from API
- Options may change frequently
- Need search/filter functionality
- Working with relational data (foreign keys)

**Use StatusSelect when:**
- Selecting from fixed/static options
- Small set of predefined choices (< 10 options)
- Enums or constants
- Boolean fields (Active/Inactive)
- No need for search

### 2. State Management

```typescript
// ✅ GOOD - Keep both ID and full object
const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

<LookupSelect
  value={selectedUser}
  onChange={(value) => {
    field.onChange(value?.id);     // Store ID in form
    setSelectedUser(value);        // Keep object for display
  }}
/>

// ❌ BAD - Only storing ID makes it hard to display selected value
<LookupSelect
  value={field.value}  // Just an ID, not an object
  onChange={field.onChange}
/>
```

### 3. Query Keys

```typescript
// ✅ GOOD - Specific, descriptive query keys
queryKey={['users', 'active']}
queryKey={['roles']}
queryKey={['consumers', 'by-route', routeId]}

// ❌ BAD - Generic or unclear keys
queryKey={['data']}
queryKey={['list']}
```

### 4. Error Handling

```typescript
// ✅ GOOD - Display validation errors
<LookupSelect
  error={!!fieldState.error}
  helperText={fieldState.error?.message}
  required
/>

// Form validation
const schema = z.object({
  user_id: z.number({
    required_error: 'User is required',
    invalid_type_error: 'Please select a valid user',
  }),
});
```

### 5. MapOption Function

```typescript
// ✅ GOOD - Include extra fields you might need
mapOption={(user) => ({
  id: user.id,
  label: user.full_name,
  email: user.email,       // Available in selected value
  phone: user.phone,       // Available in selected value
  is_active: user.is_active,
})}

// ❌ BAD - Only minimal fields
mapOption={(user) => ({
  id: user.id,
  label: user.full_name,
})}
```

## Common Patterns

### Active/Inactive Status
```typescript
const STATUS_OPTIONS: StatusOption[] = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' },
];
```

### Priority Levels
```typescript
const PRIORITY_OPTIONS: StatusOption[] = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
  { value: 4, label: 'Critical' },
];
```

### Yes/No Boolean
```typescript
const YES_NO_OPTIONS: StatusOption[] = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];
```

## Performance Considerations

1. **React Query Caching** - Options are cached for 5 minutes by default
2. **Stale-While-Revalidate** - Shows cached data while fetching updates
3. **Background Refetch** - Keeps data fresh without blocking UI
4. **Deduplication** - Multiple components using same queryKey share one request

## Accessibility

Both components include:
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Error announcements

## TypeScript Support

Full type safety with generics:

```typescript
interface CustomOption extends LookupOption {
  customField: string;
}

<LookupSelect<CustomOption>
  // TypeScript knows value is CustomOption | null
  value={value}
  // TypeScript enforces mapOption returns CustomOption
  mapOption={(item) => ({
    id: item.id,
    label: item.name,
    customField: item.custom,
  })}
/>
```
