import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import './Tooltip.css'

const Tooltip = ({ 
  children, 
  content, 
  side = 'top', 
  align = 'center',
  delayDuration = 300,
  maxWidth = 300,
  showArrow = true
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="tooltip-content"
          side={side}
          align={align}
          sideOffset={5}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {content}
          {showArrow && (
            <TooltipPrimitive.Arrow className="tooltip-arrow" />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export default Tooltip
