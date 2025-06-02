import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Permission {
  id: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
  active?: boolean;
  [key: string]: any;
}

interface AbilityState {
  permissions: Permission[];
}

const initialState: AbilityState = {
  permissions: [],
};

const abilitySlice = createSlice({
  name: 'ability',
  initialState,
  reducers: {
    setAbility(state, action: PayloadAction<Permission[]>) {
      state.permissions = action.payload;
    },
  },
});

export const { setAbility } = abilitySlice.actions;
export default abilitySlice.reducer;