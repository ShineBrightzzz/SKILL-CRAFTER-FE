import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    username: string;  // Username of the user
    role_id: string;   // Role ID associated with the user
    permissionIds : [];
}

interface AccountState {
    users: User[];     // Array of users
    selectedUser: User | null; // Currently selected user
    loading: boolean;  // Loading state
    error: string | null; // Error state
}

const initialState: AccountState = {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
};

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
        },
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

// Export actions
export const { setUsers, setSelectedUser, setLoading, setError } = accountSlice.actions;

// Export reducer
export default accountSlice.reducer;