import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoutes from "./utility/ProtectedRoutes";
import PublicRoutes from "./utility/PublicRoutes";

const Layout = lazy(() => (import("./pages/Layout")));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoutes>
          <Layout />
        </ProtectedRoutes>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />
        }
      ]
    },
    {
      path: "/login",
      element: (
        <PublicRoutes>
          <Login />
        </PublicRoutes>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoutes>
          <Register />
        </PublicRoutes>
      ),
    },
    {
      path: "*",
      element: <h1>Not Found</h1>,
    },
  ]);

  return (
    <UserProvider>
      <Suspense fallback={<h1>Loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </UserProvider>
  );
}

export default App;
