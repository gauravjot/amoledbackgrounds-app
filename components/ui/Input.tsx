import {cn} from "@/lib/utils/cn";
import * as React from "react";
import {TextInput, View} from "react-native";
import {Button, ButtonText} from "./Button";
import {X} from "lucide-react-native";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  showClearButton?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({className, showClearButton, ...props}, ref) => {
    return (
      <View className="flex-1 h-12">
        <TextInput
          ref={ref}
          selectionColor={"#909AD5"}
          className={cn(
            "px-6 text-base font-sans bg-zinc-900 text-white border-zinc-700",
            props.editable === false && "opacity-50 web:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {showClearButton && props.value && props.value.length > 0 && (
          <Button
            variant="ghost"
            className="absolute top-0 bottom-0 right-0 flex items-center justify-center h-12"
            onPress={() => {
              if (props.onChangeText) {
                props.onChangeText("");
              }
            }}>
            <X size={16} color="white" />
          </Button>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";

export {Input};
