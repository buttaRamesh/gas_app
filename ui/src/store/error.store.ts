import { create } from "zustand";

type ErrorState = {
  message: string | null;
  open: boolean;

  showError: (msg: string) => void;
  hideError: () => void;
};

export const useErrorStore = create<ErrorState>((set) => ({
  message: null,
  open: false,

  showError: (msg) =>
    set({
      message: msg,
      open: true,
    }),

  hideError: () =>
    set({
      open: false,
      message: null,
    }),
}));
