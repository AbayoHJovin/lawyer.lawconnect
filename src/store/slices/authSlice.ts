import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../lib/axios";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
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
  phone: string;
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

interface LoginResponse {
  token: string;
  user: User;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Check if token exists in local storage on app load
const token = localStorage.getItem("auth_token");
if (token) {
  try {
    const decoded: any = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp * 1000 > Date.now()) {
      initialState.isAuthenticated = true;
      initialState.user = decoded.user;
    } else {
      localStorage.removeItem("auth_token");
    }
  } catch (error) {
    localStorage.removeItem("auth_token");
  }
}

export const loginByEmail = createAsyncThunk(
  "auth/loginByEmail",
  async (payload: LoginByEmailPayload, { rejectWithValue }) => {
    try {
      const response = await API.post<LoginResponse>(
        "/citizens/login-by-email",
        payload
      );
      localStorage.setItem("auth_token", response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const loginByPhone = createAsyncThunk(
  "auth/loginByPhone",
  async (payload: LoginByPhonePayload, { rejectWithValue }) => {
    try {
      const response = await API.post<LoginResponse>(
        "/citizens/login-by-phone",
        payload
      );
      localStorage.setItem("auth_token", response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerCitizen = createAsyncThunk(
  "auth/registerCitizen",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await API.post("/citizens/add", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
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
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Password change failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("auth_token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login by email
    builder.addCase(loginByEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginByEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(loginByEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login by phone
    builder.addCase(loginByPhone.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginByPhone.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(loginByPhone.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register citizen
    builder.addCase(registerCitizen.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerCitizen.fulfilled, (state) => {
      state.loading = false;
      // Do not log user in after registration - as per requirements, redirect to login
    });
    builder.addCase(registerCitizen.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Change password
    builder.addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
