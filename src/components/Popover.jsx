import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import './Popover.css'

const Popover = ({ 
  children, 
  content, 
  trigger = 'click', // 'click', 'hover', 'focus', 'manual'
  side = 'bottom', 
  align = 'center',
  showArrow = true,
  maxWidth = 300,
  open,
  onOpenChange
}) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="popover-content"
          side={side}
          align={align}
          sideOffset={5}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {content}
          {showArrow && (
            <PopoverPrimitive.Arrow className="popover-arrow" />
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export default Popover
