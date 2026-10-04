import { configureStore } from '@reduxjs/toolkit'
import mapReducer from './mapSlice'

export const store = configureStore({
  reducer: {
    map: mapReducer,
  },
  // The map date range is stored as Date objects.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          'meta.arg',
          'meta.baseQueryMeta',
          'payload.from',
          'payload.to',
        ],
        ignoredPaths: ['map.query.from', 'map.query.to'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
