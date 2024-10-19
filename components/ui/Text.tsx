import {cn} from "@/lib/utils/cn";
import * as React from "react";
import {Text as RNText} from "react-native";

const Text = React.forwardRef<
  React.ElementRef<typeof RNText>,
  React.ComponentPropsWithoutRef<typeof RNText>
>(({className, ...props}, ref) => {
  return (
    <RNText
      className={cn("text-base text-foreground font-sans", className)}
      ref={ref}
      {...props}
    />
  );
});
Text.displayName = "Text";

export {Text};
