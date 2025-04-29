import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginByEmail, loginByPhone } from "@/services/authService";
import {
  LawyerDto,
  lawyerLoginByEmail,
  lawyerLoginByPhone,
  LawyerLoginResponse,
} from "@/services/lawyerService";
import API from "../../lib/axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { AppDispatch } from "..";

interface TokenResponse {
  message: string;
  data: string;
}

interface JwtPayload {
  sub: string;
  fullName?: string;
  phone?: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  languagePreference: string;
  location: string;
}

interface AuthError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginByEmailPayload {
  email: string;
  password: string;
}

interface LoginByPhonePayload {
  phoneNumber: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  languagePreference: string;
  location: string;
  password: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface BackendCitizen {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  citizen: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
}

interface CitizenDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  languagePreference: string;
  location: string;
}

interface CitizenResponse {
  data: CitizenDto;
}

interface ApiResponse<T> {
  data: T;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Try to call a protected endpoint
      const res = await API.get("/auth/protected");
      if (res.status === 200) {
        return { authenticated: true };
      } else {
        return rejectWithValue("Not authenticated");
      }
    } catch (error: unknown) {
      return rejectWithValue("Authentication check failed");
    }
  }
);

export const loginByEmailThunk = createAsyncThunk(
  "auth/loginByEmail",
  async (credentials: LoginByEmailPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await loginByEmail(
        credentials.email,
        credentials.password
      );
      // Fetch complete lawyer data
      const userResponse = await API.get<{ message: string; data: any }>(
        `/lawyers/find-by-email?email=${credentials.email}`
      );
      const lawyer = userResponse.data.data;
      dispatch(setUser(lawyer));
      return {
        citizen: lawyer,
      };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return rejectWithValue(
        authError.response?.data?.message || "Login failed"
      );
    }
  }
);

export const loginByPhoneThunk = createAsyncThunk(
  "auth/loginByPhone",
  async (credentials: LoginByPhonePayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await loginByPhone(
        credentials.phoneNumber,
        credentials.password
      );
      // Fetch complete lawyer data using the email from the login response
      const userResponse = await API.get<{ message: string; data: any }>(
        `/lawyers/find-by-email?email=${response.citizen.email}`
      );
      const lawyer = userResponse.data.data;
      dispatch(setUser(lawyer));
      return {
        citizen: lawyer,
      };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return rejectWithValue(
        authError.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerCitizen = createAsyncThunk(
  "auth/registerCitizen",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await API.post("/citizens/add", payload);
      return response.data;
    } catch (error: unknown) {
      const authError = error as AuthError;
      return rejectWithValue(
        authError.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      const response = await API.put("/citizens/change-password", payload);
      return response.data;
    } catch (error: unknown) {
      const authError = error as AuthError;
      return rejectWithValue(
        authError.response?.data?.message || "Password change failed"
      );
    }
  }
);

// export const fetchCurrentUser = createAsyncThunk(
//   "auth/fetchCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       // Fetch user data from a protected endpoint or user info endpoint
//       const response = await API.get<ApiResponse<LawyerDto>>(
//         "/lawyers/lawy/getCurrent"
//       );
//       return response.data.data;
//     } catch (error: unknown) {
//       const authError = error as AuthError;
//       return rejectWithValue(
//         authError.response?.data?.message || "Failed to fetch user data"
//       );
//     }
//   }
// );

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call your logout API here if needed
      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const loginLawyerByEmailThunk = createAsyncThunk(
  "auth/loginLawyerByEmail",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response: LawyerLoginResponse = await lawyerLoginByEmail(
        credentials.email,
        credentials.password
      );
      // Fetch the latest lawyer data from the backend
      const userResponse = await API.get<{ message: string; data: any }>(
        `/lawyers/find-by-email?email=${encodeURIComponent(credentials.email)}`
      );
      return {
        lawyer: userResponse.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const loginLawyerByPhoneThunk = createAsyncThunk(
  "auth/loginLawyerByPhone",
  async (
    credentials: { phone: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response: LawyerLoginResponse = await lawyerLoginByPhone(
        credentials.phone,
        credentials.password
      );
      // Fetch the latest lawyer data from the backend
      const userResponse = await API.get<{ message: string; data: any }>(
        `/lawyers/find-by-phone?phone=${encodeURIComponent(credentials.phone)}`
      );
      return {
        lawyer: userResponse.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const fetchCurrentLawyer = createAsyncThunk(
  "auth/fetchCurrentLawyer",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };

    // If we already have user data, no need to fetch
    if (state.auth.user && state.auth.isAuthenticated) {
      return state.auth.user;
    }

    try {
      const response = await API.get("/lawyers/lawy/getCurrent");
      if (response.status === 200 && response.data?.data) {
        return response.data.data;
      }
      return rejectWithValue("Failed to fetch lawyer data");
    } catch (error: unknown) {
      const authError = error as AuthError;
      return rejectWithValue(
        authError.response?.data?.message || "Failed to fetch current lawyer"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login by Email
      .addCase(loginByEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginByEmailThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.citizen;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginByEmailThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login by Phone
      .addCase(loginByPhoneThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginByPhoneThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.citizen;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginByPhoneThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login Lawyer by Email
      .addCase(loginLawyerByEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginLawyerByEmailThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.lawyer;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginLawyerByEmailThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login Lawyer by Phone
      .addCase(loginLawyerByPhoneThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginLawyerByPhoneThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.lawyer;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginLawyerByPhoneThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current Lawyer
      .addCase(fetchCurrentLawyer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentLawyer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentLawyer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
