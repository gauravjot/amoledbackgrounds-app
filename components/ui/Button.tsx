import {cva, type VariantProps} from "class-variance-authority";
import * as React from "react";
import {Pressable} from "react-native";
import {cn} from "@/lib/utils/cn";
import {Text} from "./Text";

const buttonVariants = cva("group flex items-center gap-2 justify-center rounded-md", {
  variants: {
    variant: {
      destructive: "bg-destructive active:opacity-90",
      outline: "border border-input bg-background active:bg-accent",
      secondary: "bg-secondary active:opacity-80",
      ghost: "active:bg-white/10",
      link: "active:underline",
      accent: "bg-accent active:bg-accent/90",
    },
    size: {
      default: "h-12 px-5",
      xs: "h-6 px-2",
      sm: "h-8 px-3",
      md: "h-10 px-5",
      lg: "px-8 h-14",
      icon: "h-10 w-10",
    },
    flex: {
      row: "flex-row",
      column: "flex-col",
    },
  },
  defaultVariants: {
    variant: "accent",
    size: "default",
    flex: "row",
  },
});

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-destructive-foreground",
      outline: "group-active:text-accent-foreground",
      secondary: "text-secondary-foreground group-active:text-secondary-foreground",
      ghost: "group-active:text-accent-foreground",
      link: "text-primary group-active:underline",
      accent: "text-accent-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      md: "text-sm",
      lg: "text-lg",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> & VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({className, variant, size, flex, ...props}, ref) => {
    return (
      <Pressable
        className={cn(props.disabled && "opacity-50", buttonVariants({variant, size, flex, className}))}
        ref={ref}
        role="button"
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const ButtonText = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text> & VariantProps<typeof buttonTextVariants>
>(({className, variant, size, ...props}, ref) => {
  return (
    <Text
      className={cn("font-medium font-sans", buttonTextVariants({variant, size, className}))}
      ref={ref}
      {...props}
    />
  );
});
ButtonText.displayName = "ButtonText";

export {Button, buttonVariants, ButtonText, buttonTextVariants};
export type {ButtonProps};
