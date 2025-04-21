import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Role {
    id: string;                // Unique identifier for the role
    name: string;              // Name of the role (e.g., "MODERATOR")
    description: string;       // Description of the role (e.g., "Người kiểm duyệt")
    active: boolean;           // Status of the role (active/inactive)
    permissionIds: number[];   // Array of permission IDs associated with the role
}

interface RolesState {
    roles: Role[];
    selectedRole: Role | null;
    loading: boolean;
    error: string | null;
}

const initialState: RolesState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
};

const rolesSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        setRoles: (state, action: PayloadAction<Role[]>) => {
            state.roles = action.payload;
        },
        setSelectedRole: (state, action: PayloadAction<Role | null>) => {
            state.selectedRole = action.payload;
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
export const { setRoles, setSelectedRole, setLoading, setError } = rolesSlice.actions;

// Export reducer
export default rolesSlice.reducer;
