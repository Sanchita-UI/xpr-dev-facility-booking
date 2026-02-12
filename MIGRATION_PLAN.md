# Modal Migration Plan: Custom to Radix UI Dialog

## Overview
This document outlines the migration plan from custom modal components to Radix UI Dialog-based modals for better accessibility, maintainability, and long-term support.

## Why Migrate to Radix UI Dialog?

### Benefits:
1. **Accessibility**: Built-in ARIA attributes, keyboard navigation, focus management
2. **Maintainability**: Well-maintained library with active community
3. **Features**: Portal rendering, focus trap, escape key handling, click-outside detection
4. **TypeScript**: Full TypeScript support
5. **Lightweight**: ~5KB gzipped
6. **Standards Compliant**: WCAG 2.1 AA compliant

### Current State:
- Custom modal implementation with manual overlay/portal handling
- Manual accessibility attributes
- Manual keyboard event handling

## Migration Strategy

### Phase 1: Setup (✅ Completed)
- [x] Install `@radix-ui/react-dialog`
- [x] Create `BaseModalRadix.jsx` component
- [x] Create `BaseModalRadix.css` styles

### Phase 2: Parallel Implementation (Current)
- [ ] Keep existing `BaseModal.jsx` for backward compatibility
- [ ] Use `BaseModalRadix.jsx` for new modals
- [ ] Test both implementations side-by-side

### Phase 3: Gradual Migration
Migrate modals one at a time in this order:

#### Priority 1: EditSessionModal (Low Risk)
- [x] Already using BaseModal
- [ ] Update to use `BaseModalRadix`
- [ ] Test edit functionality
- [ ] Verify form interactions

#### Priority 2: SendContractModal (Medium Risk)
- [ ] Update to use `BaseModalRadix`
- [ ] Test form submission
- [ ] Verify email functionality

#### Priority 3: FirmContractModal (Low Risk)
- [ ] Update to use `BaseModalRadix`
- [ ] Test confirmation flow

#### Priority 4: CancelContractModal (Low Risk)
- [ ] Update to use `BaseModalRadix`
- [ ] Test cancellation flow

### Phase 4: Cleanup
- [ ] Remove old `BaseModal.jsx` and `BaseModal.css`
- [ ] Rename `BaseModalRadix.jsx` to `BaseModal.jsx`
- [ ] Update all imports
- [ ] Remove unused dependencies (if any)

## Implementation Guide

### Step 1: Update Import
```jsx
// Old
import BaseModal from './BaseModal'

// New
import BaseModalRadix from './BaseModalRadix'
```

### Step 2: Component Usage (Same API)
The API is identical, so no changes needed:
```jsx
<BaseModalRadix
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="medium"
  footer={footerContent}
>
  {children}
</BaseModalRadix>
```

### Step 3: Testing Checklist
For each migrated modal:
- [ ] Opens/closes correctly
- [ ] Keyboard navigation works (Tab, Shift+Tab, Escape)
- [ ] Focus trap works (can't tab outside modal)
- [ ] Click outside closes modal
- [ ] Screen reader announces modal correctly
- [ ] Mobile responsive
- [ ] All form interactions work
- [ ] Animations are smooth

## Breaking Changes

### None Expected
The API is designed to be identical to the current `BaseModal` component. However, be aware of:

1. **Portal Rendering**: Radix uses portals by default (better for z-index)
2. **Focus Management**: Automatic focus trap (may affect custom focus logic)
3. **Event Handling**: Radix handles escape key and click-outside automatically

## Rollback Plan

If issues arise:
1. Keep `BaseModal.jsx` as fallback
2. Use feature flag to switch between implementations
3. Revert specific modal if needed

## Timeline

- **Week 1**: Setup and testing (✅ Completed)
- **Week 2**: Migrate EditSessionModal
- **Week 3**: Migrate SendContractModal
- **Week 4**: Migrate FirmContractModal and CancelContractModal
- **Week 5**: Cleanup and documentation

## Resources

- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
- [Accessibility Guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Component API Reference](./src/components/BaseModalRadix.jsx)

## Notes

- All existing modals will continue to work during migration
- No user-facing changes expected
- Improved accessibility is the main benefit
- Better long-term maintainability

