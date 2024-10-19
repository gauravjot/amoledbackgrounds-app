import {cn} from "@/lib/utils/cn";
import * as React from "react";
import {TextInput} from "react-native";

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(({className, ...props}, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "px-6 py-1 text-base font-sans bg-zinc-900 text-white border-zinc-700",
        props.editable === false && "opacity-50 web:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export {Input};
