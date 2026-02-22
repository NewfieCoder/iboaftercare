"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

const MobileSelect = React.forwardRef(({ 
  value, 
  onValueChange, 
  children, 
  placeholder = "Select an option",
  className,
  ...props 
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const options = React.Children.toArray(children)
  const selectedOption = options.find(child => child.props.value === value)

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className
        )}
        {...props}
      >
        <span className="line-clamp-1">
          {selectedOption ? selectedOption.props.children : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 space-y-2">
            {options.map((option) => {
              const isSelected = option.props.value === value
              return (
                <button
                  key={option.props.value}
                  onClick={() => {
                    onValueChange(option.props.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors",
                    isSelected 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="text-sm font-medium">{option.props.children}</span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                </button>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
})
MobileSelect.displayName = "MobileSelect"

const MobileSelectItem = ({ value, children }) => {
  return null // This is just a placeholder for children structure
}
MobileSelectItem.displayName = "MobileSelectItem"

export { MobileSelect, MobileSelectItem }