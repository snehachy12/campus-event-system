// Helper function to get current user from localStorage (client-side)
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !userRole || !currentUser) {
      return null;
    }
    
    return {
      isLoggedIn: isLoggedIn === 'true',
      role: userRole,
      user: JSON.parse(currentUser)
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to check if user is authenticated teacher
export const isAuthenticatedTeacher = () => {
  const auth = getCurrentUser();
  return auth && auth.isLoggedIn && auth.role === 'teacher';
};

// Helper function to redirect if not authenticated
export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticatedTeacher()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// Helper function to get current teacher ID
export const getCurrentTeacherId = () => {
  const auth = getCurrentUser();
  return auth?.user?.id || null;
};

// Helper function to get current teacher info
export const getCurrentTeacherInfo = () => {
  const auth = getCurrentUser();
  return auth?.user || null;
};

// Helper function to check if user is authenticated admin
export const isAuthenticatedAdmin = () => {
  const auth = getCurrentUser();
  return auth && auth.isLoggedIn && auth.role === 'admin';
};

// Helper function to redirect if not authenticated admin
export const redirectIfNotAuthenticatedAdmin = () => {
  if (!isAuthenticatedAdmin()) {
    window.location.href = '/admin/login';
    return false;
  }
  return true;
};

// Helper function to get current admin info
export const getCurrentAdminInfo = () => {
  const auth = getCurrentUser();
  return auth?.user || null;
};
