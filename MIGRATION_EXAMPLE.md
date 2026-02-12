# Migration Example: Using BaseModalRadix

## Quick Start

### Basic Usage (Same API as BaseModal)

```jsx
import BaseModalRadix from './components/BaseModalRadix'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <BaseModalRadix
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
        size="medium"
        description="Optional description for screen readers"
        footer={
          <>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </>
        }
      >
        <p>Your modal content here</p>
      </BaseModalRadix>
    </>
  )
}
```

## Migration Steps

### Step 1: Update Import

**Before:**
```jsx
import BaseModal from './components/BaseModal'
```

**After:**
```jsx
import BaseModalRadix from './components/BaseModalRadix'
```

### Step 2: Update Component Name

**Before:**
```jsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Title"
>
  {children}
</BaseModal>
```

**After:**
```jsx
<BaseModalRadix
  isOpen={isOpen}
  onClose={onClose}
  title="Title"
>
  {children}
</BaseModalRadix>
```

### Step 3: Test

1. Open/close functionality
2. Keyboard navigation (Tab, Escape)
3. Click outside to close
4. Screen reader compatibility
5. Mobile responsiveness

## New Features Available

### 1. Accessibility Description
```jsx
<BaseModalRadix
  title="Edit Session"
  description="Edit session details including dates, times, and location"
  // ... other props
/>
```

### 2. Automatic Features (No Code Needed)
- ✅ Focus trap (can't tab outside modal)
- ✅ Escape key handling
- ✅ Click outside to close
- ✅ Portal rendering (better z-index handling)
- ✅ ARIA attributes
- ✅ Screen reader announcements

## Complete Example: EditSessionModal

See `src/components/EditSessionModalRadix.jsx` for a complete example of a migrated modal.

## Testing Checklist

- [ ] Modal opens/closes correctly
- [ ] Escape key closes modal
- [ ] Click outside closes modal
- [ ] Tab navigation stays within modal
- [ ] Screen reader announces modal
- [ ] All form interactions work
- [ ] Mobile responsive
- [ ] Animations are smooth

## Rollback

If you need to rollback, simply change the import back to `BaseModal`:

```jsx
import BaseModal from './components/BaseModal'
```

Both components can coexist during migration.

