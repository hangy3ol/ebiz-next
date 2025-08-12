import { useProfileStore } from '@/common/stores/useProfileStore';

export const getProfile = () => {
  return useProfileStore.getState().profile;
};
