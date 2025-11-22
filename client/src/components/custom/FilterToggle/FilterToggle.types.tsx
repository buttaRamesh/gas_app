export interface FilterOption {
  value: string;
  colors: {
    selected: string;
    unselected: string;
  };
}

export interface FilterToggleProps {
  label?: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
}
