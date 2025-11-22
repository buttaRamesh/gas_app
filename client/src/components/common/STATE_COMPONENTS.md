# State Display Components

Standardized components for displaying loading, error, and empty states throughout the application.

## Overview

These components provide:
- **Consistent UX** across all loading, error, and empty states
- **Reduced boilerplate** with reusable, configurable components
- **Flexible variants** for different use cases
- **Integration** with error handling system

## Components

### 1. LoadingState

Displays loading indicators with optional messages.

```typescript
import { LoadingState } from '@/components/common';

// Circular spinner with message (default)
<LoadingState message="Loading data..." />

// Linear progress bar
<LoadingState variant="linear" message="Processing..." />

// Minimal spinner (no message)
<LoadingState variant="minimal" />

// Fullscreen loading
<LoadingState
  fullscreen
  message="Initializing application..."
  size={60}
/>

// Custom height
<LoadingState
  message="Loading..."
  height={400}
/>
```

**Props:**
- `message?: string` - Loading message to display
- `variant?: 'circular' | 'linear' | 'minimal'` - Type of loading indicator (default: 'circular')
- `size?: number` - Size of circular progress (default: 40)
- `fullscreen?: boolean` - Center in viewport (default: false)
- `height?: string | number` - Custom container height
- `sx?: object` - Custom styles

**Variants:**
- **circular** - Default, centered spinner with optional message
- **linear** - Progress bar at top with optional message below
- **minimal** - Small centered spinner, no message

### 2. ErrorState

Displays error messages with retry functionality.

```typescript
import { ErrorState } from '@/components/common';

// Simple alert with retry
<ErrorState
  message="Failed to load data"
  onRetry={loadData}
/>

// Warning instead of error
<ErrorState
  severity="warning"
  message="Some data may be outdated"
  onRetry={handleRefresh}
/>

// Paper variant with title
<ErrorState
  variant="paper"
  title="Unable to Connect"
  message="Please check your internet connection and try again"
  onRetry={handleRetry}
/>

// Custom action buttons
<ErrorState
  message="Failed to save changes"
  actions={
    <>
      <Button onClick={handleDiscard}>Discard</Button>
      <Button onClick={handleRetry} variant="contained">
        Try Again
      </Button>
    </>
  }
/>

// Minimal inline error
<ErrorState
  variant="minimal"
  message="Invalid input"
  severity="error"
/>
```

**Props:**
- `message: string` - Error message to display (required)
- `variant?: 'alert' | 'paper' | 'minimal'` - Display style (default: 'alert')
- `severity?: 'error' | 'warning' | 'info'` - Severity level (default: 'error')
- `onRetry?: () => void` - Retry button callback
- `retryText?: string` - Retry button text (default: 'Retry')
- `title?: string` - Error title (used in paper variant)
- `icon?: React.ReactNode` - Custom icon
- `actions?: React.ReactNode` - Custom action buttons
- `sx?: object` - Custom styles

**Variants:**
- **alert** - MUI Alert component (default)
- **paper** - Card-like display with icon, good for full-page errors
- **minimal** - Compact inline display

### 3. EmptyState

Displays empty state messages with optional actions.

```typescript
import { EmptyState } from '@/components/common';
import { PeopleIcon, AddIcon } from '@mui/icons-material';

// Simple empty state
<EmptyState message="No items found" />

// With action button
<EmptyState
  message="No consumers found"
  action={{
    label: 'Add Consumer',
    onClick: handleAddConsumer,
  }}
/>

// With custom icon and title
<EmptyState
  icon={<PeopleIcon sx={{ fontSize: 64 }} />}
  title="No Users Yet"
  message="Get started by creating your first user"
  action={{
    label: 'Create User',
    onClick: handleCreate,
    icon: <AddIcon />,
    variant: 'contained',
  }}
/>

// Paper variant
<EmptyState
  variant="paper"
  title="Empty List"
  message="No items to display"
  action={{
    label: 'Import Data',
    onClick: handleImport,
  }}
  secondaryAction={{
    label: 'Learn More',
    onClick: handleLearnMore,
  }}
/>

// Minimal variant
<EmptyState
  variant="minimal"
  message="No results found"
/>
```

**Props:**
- `message: string` - Empty state message (required)
- `icon?: React.ReactNode` - Icon to display
- `title?: string` - Title/heading
- `variant?: 'default' | 'paper' | 'minimal'` - Display style (default: 'default')
- `action?: object` - Primary action button config
  - `label: string` - Button text
  - `onClick: () => void` - Click handler
  - `icon?: React.ReactNode` - Button icon
  - `variant?: 'contained' | 'outlined' | 'text'` - Button variant
- `secondaryAction?: object` - Secondary action button config
- `sx?: object` - Custom styles

**Variants:**
- **default** - Centered with dashed border
- **paper** - Card-like with solid border
- **minimal** - Compact display

## Usage Patterns

### 1. Page-Level Loading/Error/Empty

```typescript
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

function DataPage() {
  const [data, setData] = useState([]);
  const { execute, loading, error } = useAsyncOperation({
    errorPrefix: 'Failed to load data',
  });

  const loadData = async () => {
    const response = await execute(() => api.getData());
    if (response) {
      setData(response.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading state
  if (loading && !data.length) {
    return (
      <Container>
        <PageHeader title="Data" />
        <LoadingState message="Loading data..." />
      </Container>
    );
  }

  // Error state
  if (error && !data.length) {
    return (
      <Container>
        <PageHeader title="Data" />
        <ErrorState
          message={error}
          onRetry={loadData}
        />
      </Container>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <Container>
        <PageHeader title="Data" />
        <EmptyState
          title="No Data Found"
          message="Get started by adding your first item"
          action={{
            label: 'Add Item',
            onClick: () => navigate('/data/create'),
          }}
        />
      </Container>
    );
  }

  // Success state - render data
  return (
    <Container>
      <PageHeader title="Data" />
      {/* Render data */}
    </Container>
  );
}
```

### 2. Inline Loading/Error

```typescript
function DataSection() {
  const { data, loading, error, refetch } = useQuery('data', fetchData);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Statistics</Typography>

        {loading && <LoadingState variant="minimal" />}

        {error && (
          <ErrorState
            variant="minimal"
            message="Failed to load statistics"
            onRetry={refetch}
          />
        )}

        {data && (
          <Grid container spacing={2}>
            {/* Render statistics */}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Form Submission States

```typescript
function FormPage() {
  const { execute, loading } = useAsyncOperation({
    successMessage: 'Saved successfully',
    errorPrefix: 'Failed to save',
  });

  const handleSubmit = async (formData) => {
    const result = await execute(() => api.save(formData));
    if (result) {
      navigate('/success');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {loading && (
        <LoadingState
          variant="linear"
          message="Saving changes..."
        />
      )}

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

### 4. List with Empty State

```typescript
function UserList() {
  const { data: users } = useQuery('users', fetchUsers);

  return (
    <Box>
      {users?.length === 0 ? (
        <EmptyState
          variant="paper"
          icon={<PeopleIcon sx={{ fontSize: 64 }} />}
          title="No Users Found"
          message="There are no users in the system yet"
          action={{
            label: 'Add User',
            onClick: handleAddUser,
          }}
        />
      ) : (
        <List>
          {users?.map(user => (
            <ListItem key={user.id}>
              {/* Render user */}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
```

### 5. Fullscreen Loading

```typescript
function App() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <LoadingState
        fullscreen
        message="Initializing application..."
        size={60}
      />
    );
  }

  return <Router>{/* App content */}</Router>;
}
```

## Integration with Error Handling

These components work seamlessly with the error handling system:

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingState, ErrorState } from '@/components/common';

function MyComponent() {
  const [data, setData] = useState(null);

  // useAsyncOperation provides loading and error states automatically
  const { execute, loading, error } = useAsyncOperation({
    errorPrefix: 'Failed to load',
    logContext: 'MyComponent.loadData',
  });

  const loadData = async () => {
    const result = await execute(() => api.getData());
    if (result) {
      setData(result.data);
    }
  };

  // The error state already has meaningful messages from errorHandler
  if (loading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return <div>{/* Render data */}</div>;
}
```

## Best Practices

### 1. Loading States
- Use `circular` variant for page-level loading
- Use `linear` for form submissions or progress
- Use `minimal` for inline/component-level loading
- Always provide meaningful messages
- Show loading only when fetching data, not when data already exists

### 2. Error States
- Always provide retry functionality when possible
- Use meaningful error messages (from error handling system)
- Use `alert` variant for inline errors
- Use `paper` variant for page-level errors
- Use appropriate severity (`error`, `warning`, `info`)

### 3. Empty States
- Make empty states actionable with buttons
- Use descriptive messages that guide users
- Include relevant icons
- Provide primary action when possible
- Use `paper` variant for prominent empty states

### 4. Conditional Rendering
```typescript
// ✅ GOOD - Check data existence before showing empty state
if (loading && !data) return <LoadingState />;
if (error && !data) return <ErrorState />;
if (!data || data.length === 0) return <EmptyState />;

// ❌ BAD - May flash empty state during refresh
if (loading) return <LoadingState />;
if (!data) return <EmptyState />;
```

### 5. Consistent Messaging
```typescript
// ✅ GOOD - Descriptive and actionable
<LoadingState message="Loading consumer statistics..." />
<ErrorState message={error} onRetry={reload} />
<EmptyState message="No consumers found. Add your first consumer to get started." />

// ❌ BAD - Vague and not helpful
<LoadingState message="Loading..." />
<ErrorState message="Error" />
<EmptyState message="No data" />
```

## Accessibility

All components include proper ARIA attributes:
- LoadingState uses `role="status"` for screen readers
- ErrorState uses `role="alert"` for errors
- EmptyState uses semantic HTML structure
- All buttons have descriptive labels
- Color contrast meets WCAG AA standards

## Examples from Codebase

See `pages/consumer/ConsumerStatistics.tsx` for a complete example of using all three components in a real page.
