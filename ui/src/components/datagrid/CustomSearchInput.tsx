// src/components/datagrid/CustomSearchInput.tsx
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function CustomSearchInput({ value, onChange, placeholder }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        borderBottom: "2px solid #FFCC00",       // ⬅ Always yellow
        pb: "2px",
      }}
    >
      <SearchIcon sx={{ color: "white", opacity: 0.9, fontSize: 18 }} />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "4px 0",
          color: "white",
          fontSize: "0.9rem",
        }}
      />
    </Box>
  );
}
