import { useProfileStore } from '@/stores/useProfileStore';

export const getProfile = () => {
  return useProfileStore.getState().profile;
};
