# Inline Table Editing Strategy

## Overview
This document explains the strategy and implementation approach for inline editing in the sessions table.

## Strategy Components

### 1. **State Management**
We use two key state variables to track editing:
- `editingCell`: Tracks which cell is currently being edited (`{ sessionId, field }` or `null`)
- `editValue`: Stores the temporary value while editing (before saving)

**Why this approach?**
- Only one cell can be edited at a time, preventing conflicts
- Temporary value allows for validation before committing changes
- Simple state structure makes it easy to track and debug

### 2. **Edit Lifecycle**

#### **Starting Edit (handleCellClick)**
- User clicks on an editable cell
- Check if another cell is already being edited (prevent conflicts)
- Set `editingCell` to the clicked cell's identifier
- Initialize `editValue` with the current cell value
- Cell switches from display mode to edit mode

#### **During Edit (handleCellChange)**
- User types in the input field
- `editValue` updates in real-time
- Input field is auto-focused for better UX

#### **Saving Edit (handleCellSave)**
- Triggered by:
  - **Blur event**: User clicks away from the input
  - **Enter key**: User presses Enter (handled by `handleCellKeyDown`)
- Validation: Empty values are rejected (edit is cancelled)
- Update the sessions array with the new value
- Clear editing state

#### **Canceling Edit (handleCellCancel)**
- Triggered by:
  - **Escape key**: User presses Escape
  - **Empty value save**: If user tries to save empty value
- Discard changes
- Restore original value
- Clear editing state

### 3. **Conditional Rendering**

Each editable cell uses conditional rendering:
```jsx
{isEditing(session.id, 'fieldName') ? (
  <input ... />  // Edit mode
) : (
  <span>{session.fieldName}</span>  // Display mode
)}
```

**Benefits:**
- Clean separation between display and edit modes
- Easy to add validation or formatting
- Can add different input types per field (date picker, number input, etc.)

### 4. **Editable Fields**

Currently editable:
- **Start Date** (`startDate`)
- **End Date** (`endDate`)
- **Start Time** (`startTime`)
- **End Time** (`endTime`)
- **Location** (`location`)
- **Fee** (`fee`)
- **Price** (`price`)

**Not editable (have their own controls):**
- **Facility**: Uses dropdown (already interactive)
- **Include**: Uses toggle switch (already interactive)
- **Extra Fees**: Badge display (could be made editable if needed)

### 5. **User Experience Features**

#### **Visual Feedback**
- **Hover effect**: Editable cells show light blue background on hover
- **Edit mode**: Input field has blue border and shadow
- **Cursor**: Pointer cursor indicates clickability

#### **Keyboard Navigation**
- **Enter**: Save changes
- **Escape**: Cancel editing
- **Tab**: Natural tab order (can be enhanced)

#### **Click Behavior**
- Click anywhere on the cell to start editing
- Only one cell editable at a time
- Clicking another cell while editing cancels the current edit

### 6. **Integration with Other Features**

The inline editing works seamlessly with:
- **Pagination**: Edits persist across page changes
- **Search**: Editable cells work within filtered results
- **Sorting**: Edits are maintained when sorting
- **Selection**: Checkbox selection doesn't interfere with editing

### 7. **Data Flow**

```
User clicks cell
    ↓
handleCellClick() → Set editingCell state
    ↓
Cell renders input field (conditional rendering)
    ↓
User types → handleCellChange() → Update editValue
    ↓
User presses Enter or clicks away
    ↓
handleCellSave() → Update sessions array → Clear editing state
    ↓
Cell renders updated value
```

## Implementation Details

### State Structure
```javascript
const [editingCell, setEditingCell] = useState(null) // { sessionId: 1, field: 'startDate' }
const [editValue, setEditValue] = useState('') // Temporary value
```

### Helper Function
```javascript
const isEditing = (sessionId, field) => {
  return editingCell && 
         editingCell.sessionId === sessionId && 
         editingCell.field === field
}
```

### Cell Component Pattern
```javascript
<td 
  className="editable-cell"
  onClick={() => handleCellClick(session.id, 'fieldName', session.fieldName)}
>
  {isEditing(session.id, 'fieldName') ? (
    <input
      type="text"
      className="inline-edit-input"
      value={editValue}
      onChange={handleCellChange}
      onBlur={() => handleCellSave(session.id, 'fieldName')}
      onKeyDown={(e) => handleCellKeyDown(e, session.id, 'fieldName')}
      autoFocus
    />
  ) : (
    <span>{session.fieldName}</span>
  )}
</td>
```

## Future Enhancements

### 1. **Field-Specific Input Types**
- Date fields: Use date picker
- Time fields: Use time picker
- Price/Fee fields: Use number input with currency formatting

### 2. **Validation**
- Date format validation
- Time range validation (end time > start time)
- Price format validation (currency, decimals)

### 3. **Bulk Editing**
- Select multiple rows
- Edit a field for all selected rows at once

### 4. **Undo/Redo**
- Track edit history
- Allow users to undo changes

### 5. **Save Indicators**
- Show "saving..." indicator
- Show checkmark when saved
- Show error if save fails

### 6. **Auto-save**
- Save changes automatically after a delay
- Show "unsaved changes" indicator

## Best Practices

1. **Single Source of Truth**: Always update the `sessions` state array, not local variables
2. **Validation Before Save**: Validate input before committing to state
3. **User Feedback**: Provide clear visual feedback for all actions
4. **Keyboard Support**: Support Enter/Escape for better accessibility
5. **Prevent Conflicts**: Only allow one cell to be edited at a time
6. **Preserve Data**: Don't lose data when canceling edits

## Testing Considerations

- Test editing with pagination (edit on page 2, navigate to page 1, come back)
- Test editing with search (edit filtered results)
- Test editing with sorting (edit, then sort)
- Test keyboard navigation (Enter, Escape, Tab)
- Test empty value handling
- Test rapid clicking between cells

