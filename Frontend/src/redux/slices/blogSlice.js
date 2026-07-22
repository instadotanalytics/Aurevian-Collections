// src/redux/slices/blogSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superAdminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// PUBLIC THUNKS
// ============================================

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchAll',
  async ({ page = 1, limit = 12, category, tag, search } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (category && category !== 'all') params.append('category', category);
      if (tag) params.append('tag', tag);
      if (search) params.append('search', search);

      const response = await api.get(`/blog?${params.toString()}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/blog/${slug}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchBlogs = createAsyncThunk(
  'blogs/search',
  async ({ q, category, tag, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('q', q);
      if (category && category !== 'all') params.append('category', category);
      if (tag) params.append('tag', tag);
      params.append('page', page);
      params.append('limit', limit);

      const response = await api.get(`/blog/search?${params.toString()}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============================================
// ADMIN THUNKS
// ============================================

export const fetchAllBlogsAdmin = createAsyncThunk(
  'blogs/fetchAllAdmin',
  async ({ page = 1, limit = 20, status, category, search } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status && status !== 'all') params.append('status', status);
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const response = await api.get(`/blog/admin/all?${params.toString()}`);
      if (response.data.success) {
        // ✅ Make sure to return stats from response
        return {
          data: response.data.data,
          pagination: response.data.pagination,
          stats: response.data.stats || {
            total: response.data.data?.length || 0,
            published: response.data.data?.filter(b => b.status === 'published').length || 0,
            draft: response.data.data?.filter(b => b.status === 'draft').length || 0,
            archived: response.data.data?.filter(b => b.status === 'archived').length || 0,
          }
        };
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/create',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await api.post('/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await api.put(`/blog/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await api.delete(`/blog/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============================================
// BLOG SLICE
// ============================================

const initialState = {
  blogs: [],
  featuredBlogs: [],
  currentBlog: null,
  isLoading: false,
  isUploading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  stats: null,
  searchResults: [],
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    setBlogPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data;
        state.featuredBlogs = action.payload.featured || [];
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Blog by Slug
    builder
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Search Blogs
    builder
      .addCase(searchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ✅ FIX: Fetch All Blogs Admin
    builder
      .addCase(fetchAllBlogsAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBlogsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats; // ✅ SET STATS
        state.error = null;
      })
      .addCase(fetchAllBlogsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.stats = null;
      });

    // Create Blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isUploading = false;
        state.blogs = [action.payload, ...state.blogs];
        state.currentBlog = action.payload;
        state.error = null;
        // ✅ Update stats
        if (state.stats) {
          state.stats.total = (state.stats.total || 0) + 1;
          if (action.payload.status === 'published') {
            state.stats.published = (state.stats.published || 0) + 1;
          } else if (action.payload.status === 'draft') {
            state.stats.draft = (state.stats.draft || 0) + 1;
          }
        }
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });

    // Update Blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isUploading = false;
        const index = state.blogs.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        state.currentBlog = action.payload;
        state.error = null;
        // ✅ Update stats
        // Refetch stats
        // We'll let the next fetchAllBlogsAdmin call update stats
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });

    // Delete Blog
    builder
      .addCase(deleteBlog.fulfilled, (state, action) => {
        const deletedBlog = state.blogs.find((b) => b._id === action.payload);
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
        if (state.currentBlog?._id === action.payload) {
          state.currentBlog = null;
        }
        state.error = null;
        // ✅ Update stats
        if (state.stats && deletedBlog) {
          state.stats.total = Math.max(0, (state.stats.total || 0) - 1);
          if (deletedBlog.status === 'published') {
            state.stats.published = Math.max(0, (state.stats.published || 0) - 1);
          } else if (deletedBlog.status === 'draft') {
            state.stats.draft = Math.max(0, (state.stats.draft || 0) - 1);
          } else if (deletedBlog.status === 'archived') {
            state.stats.archived = Math.max(0, (state.stats.archived || 0) - 1);
          }
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearBlogError, clearCurrentBlog, setBlogPage, clearSearchResults } = blogSlice.actions;
export default blogSlice.reducer;