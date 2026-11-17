import React, { forwardRef } from "react";
import { TextInput } from "react-native";
import { TextField, TextFieldProps } from "./TextField";

export interface NumberFieldProps extends Omit<
  TextFieldProps,
  "value" | "onChangeText" | "keyboardType"
> {
  /** Current numeric value, or undefined when the field is empty. */
  value: number | undefined;
  onChangeValue: (value: number | undefined) => void;
  /** Allows a decimal point. Odometer/mileage fields should pass false (integers only). */
  allowDecimal?: boolean;
  suffix?: string;
}

/**
 * Keeps the field's raw text in sync with a numeric value, so a user can
 * clear the field or type "1." without it being coerced mid-keystroke.
 */
export const NumberField = forwardRef<TextInput, NumberFieldProps>(
  ({ value, onChangeValue, allowDecimal = false, suffix, label, helperText, ...rest }, ref) => {
    const [text, setText] = React.useState(value !== undefined ? String(value) : "");

    React.useEffect(() => {
      const next = value !== undefined ? String(value) : "";
      setText((current) => (Number(current) === value ? current : next));
    }, [value]);

    const pattern = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;

    return (
      <TextField
        ref={ref}
        label={label}
        helperText={
          suffix ? `${helperText ?? ""}${helperText ? " · " : ""}Unit: ${suffix}` : helperText
        }
        keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
        value={text}
        onChangeText={(raw) => {
          const cleaned = raw.replace(pattern, "");
          setText(cleaned);
          onChangeValue(cleaned === "" ? undefined : Number(cleaned));
        }}
        {...rest}
      />
    );
  },
);

NumberField.displayName = "NumberField";
