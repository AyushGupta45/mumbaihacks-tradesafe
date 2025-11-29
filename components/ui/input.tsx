import * as React from "react";
import { cn } from "@/lib/utils";
import { CiSearch } from "react-icons/ci";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showIcon = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <CiSearch className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            showIcon ? "pl-10" : "",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
