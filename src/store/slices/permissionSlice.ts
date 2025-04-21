import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Permission {
    name: string;         // Name of the permission
    apiPath: string;     // API path associated with the permission
    method: string;      // HTTP method (GET, POST, etc.)
    module: string;      // Module to which the permission belongs
}

interface PermissionsState {
    permissions: Permission[];
    selectedPermission: Permission | null;
    loading: boolean;
    error: string | null;
}

const initialState: PermissionsState = {
    permissions: [],
    selectedPermission: null,
    loading: false,
    error: null,
};

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        setPermissions: (state, action: PayloadAction<Permission[]>) => {
            state.permissions = action.payload;
        },
        setSelectedPermission: (state, action: PayloadAction<Permission | null>) => {
            state.selectedPermission = action.payload;
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
export const { setPermissions, setSelectedPermission, setLoading, setError } = permissionsSlice.actions;

// Export reducer
export default permissionsSlice.reducer;