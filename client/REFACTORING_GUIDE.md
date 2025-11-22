# Frontend Refactoring Guide

This guide explains how to use the new reusable components created to reduce code duplication across the application.

## 📦 New Components Created

### 1. Common Components (`/src/components/common/`)

#### **FormDialog** - Reusable Dialog Component
Replaces repetitive dialog code with a single, type-safe component.

**Usage:**
```tsx
import { FormDialog } from '@/components/common';

const [open, setOpen] = useState(false);
const [saving, setSaving] = useState(false);

const handleSubmit = async () => {
  setSaving(true);
  try {
    await api.updateSomething(data);
    showSnackbar('Success!', 'success');
    setOpen(false);
  } catch (error) {
    showSnackbar('Error occurred', 'error');
  } finally {
    setSaving(false);
  }
};

<FormDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Edit Information"
  onSubmit={handleSubmit}
  loading={saving}
  submitLabel="Save Changes"
  maxWidth="sm"
>
  {/* Your form fields here */}
  <Stack spacing={2}>
    <TextField label="Name" value={name} onChange={...} />
    <TextField label="Email" value={email} onChange={...} />
  </Stack>
</FormDialog>
```

**Before (78 lines):**
```tsx
<Dialog open={personalDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
  <DialogTitle
    sx={{
      background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',
      color: 'white',
      fontWeight: 700,
      fontSize: '1.5rem',
      py: 2.5,
    }}
  >
    Edit Personal Information
  </DialogTitle>
  <DialogContent sx={{ pt: 5, pb: 3, px: 3 }}>
    <Stack spacing={2}>
      <TextField label="Name" ... />
      <TextField label="Father's Name" ... />
      {/* More fields */}
    </Stack>
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
    <Button onClick={handleClose} disabled={saving}>Cancel</Button>
    <Button
      onClick={handleSave}
      variant="contained"
      disabled={saving}
      sx={{
        background: 'linear-gradient(...)',
        // ... 20+ lines of styling
      }}
    >
      {saving ? <CircularProgress /> : 'Save Changes'}
    </Button>
  </DialogActions>
</Dialog>
```

**After (10 lines):**
```tsx
<FormDialog
  open={personalDialogOpen}
  onClose={() => setPersonalDialogOpen(false)}
  title="Edit Personal Information"
  onSubmit={handleSavePersonal}
  loading={saving}
>
  <PersonalInfoFields data={personalData} onChange={handlePersonalChange} />
</FormDialog>
```

**Savings: 68 lines per dialog × 7 dialogs = 476 lines in ConsumerDetail.tsx alone!**

---

#### **DetailInfoRow** - Label-Value Display Component

**Usage:**
```tsx
import { DetailInfoRow } from '@/components/common';

<DetailInfoRow
  label="Consumer Name"
  value={consumer.consumer_name}
  showDivider
/>

<DetailInfoRow
  label="Consumer Number"
  value={consumer.consumer_number}
  copyable  // Adds copy-to-clipboard button
  showDivider
/>

<DetailInfoRow
  label="Mobile"
  value={consumer.mobile}
  icon={<PhoneIcon />}
/>
```

**Before (8 lines per row):**
```tsx
<Box sx={{ display: 'flex', py: 1.5, alignItems: 'center' }}>
  <Typography variant="body2" sx={{ minWidth: 160, fontWeight: 600, color: 'text.secondary' }}>
    Consumer Name
  </Typography>
  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
    {consumer.consumer_name || '-'}
  </Typography>
</Box>
<Divider />
```

**After (1 line):**
```tsx
<DetailInfoRow label="Consumer Name" value={consumer.consumer_name} showDivider />
```

**Savings: 7 lines × 20 instances = 140 lines**

---

#### **StatCard** - Statistics Display Component

**Usage:**
```tsx
import { StatCard } from '@/components/common';
import { LocationIcon } from '@mui/icons-material';

<StatCard
  icon={<LocationIcon color="info" fontSize="large" />}
  iconColor="info"
  value={route.area_count}
  label="Total Areas"
  description="Areas assigned to this route"
  onClick={() => navigate('/areas')}
  hoverable
/>
```

**Before (35 lines):**
```tsx
<Card elevation={3} sx={{ bgcolor: "background.paper" }}>
  <CardContent>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Box sx={{
        bgcolor: "info.light",
        p: 1.5,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <LocationIcon color="info" fontSize="large" />
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {route.area_count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Areas
        </Typography>
      </Box>
    </Box>
  </CardContent>
</Card>
```

**After (7 lines):**
```tsx
<StatCard
  icon={<LocationIcon color="info" fontSize="large" />}
  iconColor="info"
  value={route.area_count}
  label="Total Areas"
/>
```

**Savings: 28 lines × 5 stat cards = 140 lines**

---

#### **GradientButton** - Styled Action Button

**Usage:**
```tsx
import { GradientButton } from '@/components/common';

<GradientButton
  variant="primary"
  onClick={handleSubmit}
  loading={submitting}
>
  Submit Form
</GradientButton>

<GradientButton
  variant="outlined"
  onClick={handleCancel}
>
  Cancel
</GradientButton>
```

**Before (15 lines):**
```tsx
<Button
  variant="contained"
  onClick={handleSubmit}
  disabled={submitting}
  sx={{
    background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',
    color: 'white',
    fontWeight: 600,
    px: 3,
    py: 1.2,
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, hsl(262 90% 68%), hsl(220 95% 72%))',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
    },
  }}
>
  {submitting ? <CircularProgress size={24} /> : 'Submit Form'}
</Button>
```

**After (6 lines):**
```tsx
<GradientButton variant="primary" onClick={handleSubmit} loading={submitting}>
  Submit Form
</GradientButton>
```

**Savings: 9 lines × 15+ buttons = 135+ lines**

---

### 2. Form Components (`/src/components/forms/`)

#### **PersonalInfoFields** - Personal Information Form

**Usage:**
```tsx
import { PersonalInfoFields } from '@/components/forms';

const [personalData, setPersonalData] = useState({
  consumer_name: '',
  father_name: '',
  mother_name: '',
  spouse_name: '',
  dob: '',
});

const handlePersonalChange = (field, value) => {
  setPersonalData(prev => ({ ...prev, [field]: value }));
};

<PersonalInfoFields
  data={personalData}
  onChange={handlePersonalChange}
  required
  showDob
  layout="grid"  // or "stacked"
/>
```

**Before (60+ lines):**
```tsx
<Stack spacing={3}>
  <TextField
    fullWidth
    required
    label="Consumer Name"
    value={personalInfo.consumer_name}
    onChange={(e) => setPersonalInfo({ ...personalInfo, consumer_name: e.target.value })}
    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
  />

  <TextField
    fullWidth
    label="Date of Birth"
    type="date"
    value={personalInfo.dob}
    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
    InputLabelProps={{ shrink: true }}
  />

  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
    <TextField label="Father's Name" ... />
    <TextField label="Mother's Name" ... />
    <TextField label="Spouse Name" ... />
  </Box>
</Stack>
```

**After (7 lines):**
```tsx
<PersonalInfoFields
  data={personalData}
  onChange={handlePersonalChange}
  required
  showDob
  layout="grid"
/>
```

**Savings: 53+ lines × 3 pages (Create/Edit/Detail) = 159+ lines**

---

#### **IdentificationFields** - ID Documents Form

**Usage:**
```tsx
import { IdentificationFields } from '@/components/forms';

<IdentificationFields
  data={identificationData}
  onChange={handleIdentificationChange}
  showValidation  // Validates Aadhar (12 digits) and PAN format
/>
```

**Features:**
- Auto-validation for Aadhar (12 digits)
- Auto-validation for PAN (10 alphanumeric, uppercase)
- Error messages with helper text
- Uppercase transformation for PAN

---

### 3. Custom Hooks (`/src/hooks/`)

#### **useConsumerLookups** - Centralized Lookup Data Fetching

**Usage:**
```tsx
import { useConsumerLookups } from '@/hooks';

function ConsumerForm() {
  const {
    categories,
    types,
    bplTypes,
    dctTypes,
    schemes,
    connectionTypes,
    products,
    routes,
    loading,
    error,
    refetch,
  } = useConsumerLookups({
    includeConnectionTypes: true,
    includeProducts: true,
    includeRoutes: true,
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load data</Alert>;

  return (
    <form>
      <Select>
        {categories.map(cat => (
          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
        ))}
      </Select>
    </form>
  );
}
```

**Before (81 lines in ConsumerDetail.tsx):**
```tsx
const [categories, setCategories] = useState<ConsumerCategory[]>([]);
const [types, setTypes] = useState<ConsumerType[]>([]);
// ... 7 more state declarations

const fetchLookupData = async () => {
  try {
    const [
      connectionTypesRes,
      productsRes,
      categoriesRes,
      consumerTypesRes,
      bplTypesRes,
      dctTypesRes,
      schemesRes,
      routesRes
    ] = await Promise.all([
      connectionTypesApi.getAll(),
      productsApi.getAll(),
      consumerCategoriesApi.getAll(),
      // ... more API calls
    ]);

    const connectionTypesData = Array.isArray(connectionTypesRes.data)
      ? connectionTypesRes.data
      : connectionTypesRes.data.results || [];

    // ... repeat for each lookup type (40+ lines)

    setConnectionTypes(connectionTypesData);
    setProducts(productsData);
    // ... more setters
  } catch (error) {
    console.error('Failed to fetch lookup data:', error);
    // ... set empty arrays
  }
};

useEffect(() => {
  fetchLookupData();
}, [id]);
```

**After (8 lines):**
```tsx
const {
  categories,
  types,
  bplTypes,
  dctTypes,
  schemes,
  loading,
} = useConsumerLookups();
```

**Savings: 73 lines × 3 pages = 219 lines**

---

## 🔄 Refactoring Examples

### Example 1: ConsumerDetail.tsx - Personal Info Dialog

**BEFORE (Lines 1575-1667, 92 lines):**
```tsx
{/* Personal Information Edit Dialog */}
<Dialog
  open={personalDialogOpen}
  onClose={() => setPersonalDialogOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
    }
  }}
>
  <DialogTitle
    sx={{
      background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',
      color: 'white',
      fontWeight: 700,
      fontSize: '1.5rem',
      py: 2.5
    }}
  >
    Edit Personal Information
  </DialogTitle>
  <DialogContent sx={{ pt: 5, pb: 3, px: 3 }}>
    <Stack spacing={2}>
      <TextField
        label="Consumer Number"
        value={consumer.consumer_number}
        disabled
        fullWidth
      />
      <TextField
        label="Person Name"
        value={personalData.person_name}
        onChange={(e) => setPersonalData({ ...personalData, person_name: e.target.value })}
        required
        fullWidth
      />
      <TextField
        label="Father's Name"
        value={personalData.father_name}
        onChange={(e) => setPersonalData({ ...personalData, father_name: e.target.value })}
        fullWidth
      />
      <TextField
        label="Mother's Name"
        value={personalData.mother_name}
        onChange={(e) => setPersonalData({ ...personalData, mother_name: e.target.value })}
        fullWidth
      />
      <TextField
        label="Spouse Name"
        value={personalData.spouse_name}
        onChange={(e) => setPersonalData({ ...personalData, spouse_name: e.target.value })}
        fullWidth
      />
      <TextField
        label="Date of Birth"
        type="date"
        value={personalData.dob}
        onChange={(e) => setPersonalData({ ...personalData, dob: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
    <Button
      onClick={() => handleCloseDialog('personal')}
      disabled={saving}
      sx={{ color: 'text.secondary', fontWeight: 600 }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleSavePersonal}
      variant="contained"
      disabled={saving}
      sx={{
        background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',
        color: 'white',
        fontWeight: 600,
        px: 3,
        py: 1,
        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
        '&:hover': {
          background: 'linear-gradient(135deg, hsl(262 90% 68%), hsl(220 95% 72%))',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
        },
      }}
    >
      {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
    </Button>
  </DialogActions>
</Dialog>
```

**AFTER (18 lines):**
```tsx
import { FormDialog } from '@/components/common';
import { PersonalInfoFields } from '@/components/forms';

{/* Personal Information Edit Dialog */}
<FormDialog
  open={personalDialogOpen}
  onClose={() => setPersonalDialogOpen(false)}
  title="Edit Personal Information"
  onSubmit={handleSavePersonal}
  loading={saving}
>
  <TextField
    label="Consumer Number"
    value={consumer.consumer_number}
    disabled
    fullWidth
    sx={{ mb: 2 }}
  />
  <PersonalInfoFields
    data={personalData}
    onChange={(field, value) => setPersonalData(prev => ({ ...prev, [field]: value }))}
    required
    showDob
    nameField="person_name"
  />
</FormDialog>
```

**Code Reduction: 92 lines → 18 lines (74 lines saved, 80% reduction!)**

---

### Example 2: ConsumerDetail.tsx - Display Info Rows

**BEFORE (Lines 977-985, multiple instances):**
```tsx
<Box sx={{ display: 'flex', py: 1.5, alignItems: 'center' }}>
  <Typography variant="body2" sx={{ minWidth: 160, fontWeight: 600, color: 'text.secondary' }}>
    Consumer Name
  </Typography>
  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
    {consumer.consumer_name}
  </Typography>
</Box>
<Divider />
```

**AFTER (1 line per row):**
```tsx
import { DetailInfoRow } from '@/components/common';

<DetailInfoRow label="Consumer Name" value={consumer.consumer_name} showDivider />
<DetailInfoRow label="Father's Name" value={consumer.father_name} showDivider />
<DetailInfoRow label="Mother's Name" value={consumer.mother_name} showDivider />
<DetailInfoRow label="Spouse Name" value={consumer.spouse_name} showDivider />
<DetailInfoRow label="Date of Birth" value={consumer.dob ? new Date(consumer.dob).toLocaleDateString() : '-'} />
```

**Code Reduction: ~160 lines → ~20 lines across the file**

---

## 📊 Total Impact

### Code Reduction Summary:
- **ConsumerDetail.tsx:** ~800 lines reduced (7 dialogs + 20 InfoRows)
- **ConsumerCreate.tsx:** ~200 lines reduced (form fields + lookups)
- **ConsumerEdit.tsx:** ~150 lines reduced (form fields + lookups)
- **RouteDetail.tsx:** ~150 lines reduced (stat cards + info rows)
- **DeliveryPersonDetail.tsx:** ~200 lines reduced (stat cards + dialogs)

### **Total Estimated Reduction: ~1,500 lines** (from Phase 1 components only)

### Benefits:
✅ **Consistency:** All dialogs, buttons, and forms look and behave the same
✅ **Maintainability:** Update styling in one place, affects entire app
✅ **Type Safety:** TypeScript interfaces ensure correct usage
✅ **Testability:** Test components once, used everywhere
✅ **Developer Experience:** Less boilerplate, faster development
✅ **Performance:** Optimized lookups hook with proper dependencies

---

## 🚀 Migration Checklist

### For each page with dialogs:
- [ ] Import `FormDialog` from `@/components/common`
- [ ] Replace `Dialog` + `DialogTitle` + `DialogContent` + `DialogActions` with `FormDialog`
- [ ] Remove custom button styling, use component's built-in styles
- [ ] Remove loading state handling from buttons

### For each detail page:
- [ ] Import `DetailInfoRow` from `@/components/common`
- [ ] Replace `Box` + `Typography` pairs with `DetailInfoRow`
- [ ] Add `copyable` prop where applicable (IDs, phone numbers)
- [ ] Remove `Divider` components, use `showDivider` prop

### For pages with statistics:
- [ ] Import `StatCard` from `@/components/common`
- [ ] Replace `Card` + `CardContent` + nested `Box` with `StatCard`
- [ ] Add `onClick` handlers where cards should be clickable

### For pages with forms:
- [ ] Import form field components from `@/components/forms`
- [ ] Replace individual `TextField` groups with form components
- [ ] Update state to use component's `onChange` handler pattern

### For pages fetching lookups:
- [ ] Import `useConsumerLookups` from `@/hooks`
- [ ] Remove individual state declarations for lookups
- [ ] Remove `fetchLookupData` function
- [ ] Use hook's destructured values directly

---

## 📝 Next Steps

### Phase 2: Additional Components to Create
1. **AdditionalConsumerFields** - For category, type, BPL, DCT, scheme fields
2. **useServerSideDataGrid** - For paginated data grids
3. **useFormDialog** - Hook for dialog state management
4. **DetailPageLayout** - Standardized detail page layout with tabs
5. **GridCardLayout** - For routes/products card grids

### Phase 3: Complete Refactoring
- Apply new components to remaining pages
- Remove duplicate code
- Test thoroughly
- Update documentation

---

## 🤝 Need Help?

For questions about using these components or suggestions for improvements:
1. Check component props in TypeScript interfaces
2. Look at examples in this guide
3. Test components in isolation first
4. Gradually refactor one dialog/section at a time

**Happy Refactoring! 🎉**
