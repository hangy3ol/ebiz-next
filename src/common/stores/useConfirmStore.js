import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
  open: false,
  title: '',
  content: '',
  resolve: null,

  show: ({ title, content }) =>
    new Promise((resolve) => {
      set({ open: true, title, content, resolve });
    }),

  confirm: () => {
    set((state) => {
      state.resolve?.(true);
      return { open: false, resolve: null };
    });
  },

  cancel: () => {
    set((state) => {
      state.resolve?.(false);
      return { open: false, resolve: null };
    });
  },
}));
