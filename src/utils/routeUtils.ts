// List of public routes that don't require authentication
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/lawyers",
  "/lawyers/:lawyerId", // Individual lawyer profiles are public
];

// Check if a given path matches any public route pattern
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some((route) => {
    // Convert route pattern to regex to handle dynamic segments
    const pattern = route
      .replace(/:[^/]+/g, "[^/]+") // Replace :param with regex pattern
      .replace(/\//g, "\\/"); // Escape forward slashes
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
};

// List of routes that require authentication
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/consultations",
  "/consultations/:consultationId",
  "/profile",
];

// Check if a given path matches any protected route pattern
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some((route) => {
    const pattern = route.replace(/:[^/]+/g, "[^/]+").replace(/\//g, "\\/");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
};
