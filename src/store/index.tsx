// import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import themeConfigSlice from './themeConfigSlice';
// import authReducer from './authSlice';
// import { alertSlice } from './features/alertSlice';
// import userReducer from './userSlice';

// const rootReducer = combineReducers({
//     themeConfig: themeConfigSlice,
//     auth: authReducer,
//     alerts: alertSlice.reducer,
//     user: userReducer,
// });

// const store = configureStore({
//     reducer: rootReducer,
//     devTools: process.env.NODE_ENV !== 'production',
// });

// export default store;

// export type IRootState = ReturnType<typeof rootReducer>;

import { combineReducers, configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import authReducer from './authSlice';
import { alertSlice } from './features/alertSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
    alerts: alertSlice.reducer,
    user: userReducer,
});

const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;

export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  IRootState,
  unknown,
  Action<string>
>;
