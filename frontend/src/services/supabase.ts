// Mock Supabase client for testing without Supabase
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null })
  })
};

// Mock functions for backward compatibility
export const getCurrentUser = async () => null;
export const getSupabaseStatus = async () => ({ connected: false, message: 'Mock mode' });

export default supabase;
