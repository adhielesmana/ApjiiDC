import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Provider {
  _id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  description: string;
  address: string;
}

interface Space {
  _id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  provider: Provider;
  _addedBy: string;
  imagesUrl: string[];
}

interface CatalogState {
  spaces: Space[];
  providers: Provider[];
  selectedSpace: Space | null;
  selectedProvider: Provider | null;
  loading: boolean;
}

const initialState: CatalogState = {
  spaces: [],
  providers: [],
  selectedSpace: null,
  selectedProvider: null,
  loading: false,
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSpaces: (state, action: PayloadAction<Space[]>) => {
      state.spaces = action.payload;
    },
    setProviders: (state, action: PayloadAction<Provider[]>) => {
      state.providers = action.payload;
    },
    setSelectedSpace: (state, action: PayloadAction<Space | null>) => {
      state.selectedSpace = action.payload;
    },
    setSelectedProvider: (state, action: PayloadAction<Provider | null>) => {
      state.selectedProvider = action.payload;
    },
    clearCatalog: (state) => {
      state.spaces = [];
      state.providers = [];
    },
  },
});

export const {
  setLoading,
  setSpaces,
  setProviders,
  setSelectedSpace,
  setSelectedProvider,
  clearCatalog,
} = catalogSlice.actions;

export default catalogSlice.reducer;
