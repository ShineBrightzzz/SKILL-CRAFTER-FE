import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AbilityState {
  permissions: any[];
}

const initialState: AbilityState = {
  permissions: [{id: 14,
                name: "XEM_DANH_SACH_VAI_TRO",
                apiPath: "/roles",
                method: "GET",
                module: "Quản lý vai trò"
              },
              {id: 14,
                name: "XEM_DANH_SACH_VAI_TRO",
                apiPath: "/permissions",
                method: "GET",
                module: "Quản lý vai trò"},
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/roles",
                  method: "POST",
                  module: "Quản lý vai trò"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/events",
                  method: "GET",
                  module: "Quản lý vai trò"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/scores",
                  method: "GET",
                  module: "Quản lý vai trò"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/roles",
                  method: "PUT",
                  module: "Quản lý vai trò"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/semester/allSemester",
                  method: "GET",
                  module: "Quản lý học kì"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/score/check-all",
                  method: "GET",
                  module: "Quản lý điểm"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/eventDetails",
                  method: "GET",
                  module: "Quản lý điểm"
                },
                {id: 14,
                  name: "XEM_DANH_SACH_VAI_TRO",
                  apiPath: "/eventDetails/ongoing",
                  method: "GET",
                  module: "Quản lý điểm"
                },
                {id: 14,
                  name: "TAO_SU_KIEN",
                  apiPath: "/eventDetails/create-event",
                  method: "POST",
                  module: "Quản lý điểm"
                },
                {
                  id: 99,
                  name: "TAO_HOC_KY",
                  apiPath: "/semester",
                  method: "POST",
                  module: "Quản lý học kì"
                },
                {
                  id: 99,
                  name: "TAO_HOC_KY",
                  apiPath: "/score/all-by-semester",
                  method: "GET",
                  module: "Quản lý điểm"
                }
            ],
};

const abilitySlice = createSlice({
  name: 'ability',
  initialState,
  reducers: {
    setRolePermissions(state, action: PayloadAction<any[]>) {
      state.permissions = action.payload;
    },
  },
});

export const { setRolePermissions } = abilitySlice.actions;
export default abilitySlice.reducer;
