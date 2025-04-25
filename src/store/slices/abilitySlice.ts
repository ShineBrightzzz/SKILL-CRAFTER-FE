import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AbilityState {
  permissions: any[];
}

const initialState: AbilityState = {
  permissions: [],
};

const abilitySlice = createSlice({
  name: 'ability',
  initialState,
  reducers: {
    setAbility(state, action: PayloadAction<any[]>) {
      state.permissions = action.payload;
    },
  },
});

export const { setAbility } = abilitySlice.actions;
export default abilitySlice.reducer;
