import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/firebase/auth';
import { User } from '../../types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  isPro: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAnonymous: true,
  isPro: false,
  error: null,
};

export const signInAnonymously = createAsyncThunk(
  'auth/signInAnonymously',
  async () => {
    const user = await AuthService.signInAnonymously();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const user = await AuthService.signInWithGoogle();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const signInWithApple = createAsyncThunk(
  'auth/signInWithApple',
  async () => {
    const user = await AuthService.signInWithApple();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await AuthService.signInWithEmailAndPassword(email, password);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await AuthService.signOut();
    await AsyncStorage.removeItem('user');
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAnonymous = action.payload?.isAnonymous ?? true;
      state.isPro = action.payload?.isPro ?? false;
    },
    setPro: (state, action: PayloadAction<boolean>) => {
      state.isPro = action.payload;
      if (state.user) {
        state.user.isPro = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign in anonymously
    builder
      .addCase(signInAnonymously.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAnonymous = true;
        state.isPro = false;
      })
      .addCase(signInAnonymously.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd logowania anonimowego';
      });

    // Sign in with Google
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAnonymous = false;
        state.isPro = true;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd logowania przez Google';
      });

    // Sign in with Apple
    builder
      .addCase(signInWithApple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAnonymous = false;
        state.isPro = true;
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd logowania przez Apple';
      });

    // Sign in with email
    builder
      .addCase(signInWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAnonymous = false;
        state.isPro = true;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd logowania';
      });

    // Sign out
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAnonymous = true;
        state.isPro = false;
        state.error = null;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAnonymous = action.payload.isAnonymous;
          state.isPro = action.payload.isPro;
        }
      });
  },
});

export const { setUser, setPro, clearError } = authSlice.actions;
export default authSlice.reducer;
