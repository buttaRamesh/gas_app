# Error Handling System

This document describes the standardized error handling system used throughout the application.

## Overview

The error handling system provides:
- **Meaningful error messages** extracted from API responses
- **Automatic error notifications** via toast messages
- **Consistent error handling patterns** across components
- **User-friendly field validation errors**
- **Automatic retry capabilities**

## Components

### 1. Error Handler Utility (`errorHandler.ts`)

Extracts meaningful error messages from various error types.

```typescript
import { getErrorMessage, logError, isAuthError, isNetworkError } from '@/utils/errorHandler';

// Extract user-friendly message from any error
const message = getErrorMessage(error);

// Log errors in development
logError(error, 'ComponentName.methodName');

// Check error types
if (isNetworkError(error)) {
  // Handle network errors
}

if (isAuthError(error)) {
  // Redirect to login
}
```

**Features:**
- Handles Django REST Framework validation errors
- Extracts field-specific error messages
- Formats field names (e.g., `phone_number` → `Phone Number`)
- Provides contextual messages based on HTTP status codes
- Limits displayed errors to prevent overwhelming users

### 2. useAsyncOperation Hook

Standardizes async operation handling with automatic error management.

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

function MyComponent() {
  const { execute, loading, error } = useAsyncOperation({
    successMessage: 'Operation completed successfully',
    errorPrefix: 'Failed to complete operation',
    onSuccess: () => {
      // Navigate away or refresh data
    },
  });

  const handleSubmit = async (data) => {
    const result = await execute(() => api.create(data));
    if (result) {
      // Handle success
    }
  };

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      <Button onClick={handleSubmit} disabled={loading}>
        Submit
      </Button>
    </div>
  );
}
```

**Options:**
- `successMessage`: Message to show on success
- `errorPrefix`: Prefix for error messages
- `showToast`: Control toast notifications
- `onSuccess`: Callback on successful operation
- `onError`: Callback on error
- `logContext`: Context for error logging

### 3. Enhanced SnackbarContext

Provides convenient methods for showing notifications.

```typescript
import { useSnackbar } from '@/contexts/SnackbarContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useSnackbar();

  const handleAction = async () => {
    try {
      await someAction();
      showSuccess('Action completed successfully');
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };
}
```

**Methods:**
- `showError(message)`: Shows error notification (6 second duration)
- `showSuccess(message)`: Shows success notification (4 seconds)
- `showWarning(message)`: Shows warning notification (5 seconds)
- `showInfo(message)`: Shows info notification (4 seconds)
- `showSnackbar(message, severity, duration)`: Custom notification

## Usage Examples

### Example 1: Form Submission with Validation Errors

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useNavigate } from 'react-router-dom';

function UserForm() {
  const navigate = useNavigate();
  const { execute, loading, error } = useAsyncOperation({
    successMessage: 'User created successfully',
    errorPrefix: 'Failed to create user',
    onSuccess: () => navigate('/users'),
  });

  const handleSubmit = async (formData) => {
    await execute(() => usersApi.create(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}
```

**API returns validation error:**
```json
{
  "email": ["This field must be unique."],
  "phone_number": ["Enter a valid phone number."]
}
```

**User sees:**
```
Failed to create user: Email: This field must be unique; Phone Number: Enter a valid phone number
```

### Example 2: Data Fetching with Error Display

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useEffect, useState } from 'react';

function DataList() {
  const [data, setData] = useState([]);
  const { execute, loading, error } = useAsyncOperation({
    errorPrefix: 'Failed to load data',
    showToast: { error: true, success: false },
  });

  const loadData = async () => {
    const result = await execute(() => api.getAll());
    if (result) {
      setData(result.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data.length) {
    return <CircularProgress />;
  }

  if (error && !data.length) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={loadData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Example 3: Multiple Independent Operations

```typescript
import { useAsyncOperations } from '@/hooks/useAsyncOperation';

function DataManager() {
  const operations = useAsyncOperations({
    save: {
      successMessage: 'Data saved successfully',
      errorPrefix: 'Failed to save',
    },
    delete: {
      successMessage: 'Data deleted successfully',
      errorPrefix: 'Failed to delete',
    },
    export: {
      successMessage: 'Export started',
      errorPrefix: 'Failed to export',
    },
  });

  const handleSave = async (data) => {
    await operations.save.execute(() => api.save(data));
  };

  const handleDelete = async (id) => {
    await operations.delete.execute(() => api.delete(id));
  };

  const handleExport = async () => {
    await operations.export.execute(() => api.export());
  };

  return (
    <div>
      <Button onClick={handleSave} disabled={operations.save.loading}>
        Save
      </Button>
      <Button onClick={handleDelete} disabled={operations.delete.loading}>
        Delete
      </Button>
      <Button onClick={handleExport} disabled={operations.export.loading}>
        Export
      </Button>
    </div>
  );
}
```

## Error Message Examples

### Network Errors
- "Network error. Please check your internet connection."
- "Request timeout. Please check your internet connection and try again."
- "Unable to connect to the server. Please try again later."

### Authentication Errors (401/403)
- "Session expired. Please log in again."
- "You do not have permission to perform this action."

### Validation Errors (400/422)
- "Email: This field must be unique"
- "Phone Number: Enter a valid phone number"
- "Password: This field is required"

### Server Errors (500+)
- "Server error. Our team has been notified. Please try again later."
- "Service temporarily unavailable. Please try again in a few moments."

### Not Found (404)
- "The requested resource was not found."

## Best Practices

1. **Always use `useAsyncOperation` for async operations**
   - Provides consistent error handling
   - Automatic loading states
   - User-friendly error messages

2. **Provide context in error messages**
   - Use `errorPrefix` to give users context
   - Use `logContext` for debugging

3. **Show meaningful error states in UI**
   - Display error alerts near relevant content
   - Provide retry buttons when appropriate
   - Don't block entire UI for recoverable errors

4. **Handle different error types appropriately**
   - Network errors: Show retry option
   - Auth errors: Redirect to login
   - Validation errors: Highlight form fields

5. **Don't overwhelm users**
   - Limit displayed field errors (max 3 + "and X more")
   - Use appropriate notification durations
   - Clear errors when appropriate

## Migration Guide

To migrate existing error handling:

### Before:
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.getData();
    setData(response.data);
  } catch (error) {
    setError(error.message);
    showSnackbar('Failed to fetch data', 'error');
  } finally {
    setLoading(false);
  }
};
```

### After:
```typescript
const { execute, loading, error } = useAsyncOperation({
  errorPrefix: 'Failed to fetch data',
});

const fetchData = async () => {
  const response = await execute(() => api.getData());
  if (response) {
    setData(response.data);
  }
};
```

## Benefits

✅ **Consistent UX**: All errors displayed uniformly across the app
✅ **Better DX**: Less boilerplate code for error handling
✅ **Meaningful Messages**: Users see actionable error information
✅ **Easier Debugging**: Automatic error logging with context
✅ **Type Safety**: Full TypeScript support
✅ **Flexible**: Customizable for different use cases
