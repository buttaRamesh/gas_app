// src/components/datagrid/UnderlineInput.tsx
import { useTheme } from "@mui/material/styles";

export default function UnderlineInput(props: any) {
  const theme = useTheme();
  const { style, ...rest } = props;

  return (
    <input
      {...(rest as any)}
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        outline: "none",
        padding: "4px 0",
        fontSize: "0.95rem",
        color: theme.palette.text.primary,
        ...style,
      }}
      className="underline-input"
    />
  );
}
