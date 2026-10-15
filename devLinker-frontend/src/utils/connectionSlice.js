import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connections",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnection: (state, action) => {
      return state.filter((conn) => conn._id !== action.payload);
    },
  },
});

export const { addConnections, removeConnections } = connectionSlice.actions;

export default connectionSlice.reducer;
