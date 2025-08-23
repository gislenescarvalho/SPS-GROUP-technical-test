import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppWrapper from "./components/AppWrapper";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Users from "./pages/Users";
import UserEdit, { userLoader } from "./pages/UserEdit";
import Metrics from "./pages/Metrics";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AccessibilityProvider>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </AccessibilityProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "users",
        element: (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <ProtectedRoute>
            <UserEdit />
          </ProtectedRoute>
        ),
        loader: userLoader,
      },
      {
        path: "metrics",
        element: (
          <ProtectedRoute>
            <Metrics />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
