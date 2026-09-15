import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoutes from "./utility/ProtectedRoutes";
import PublicRoutes from "./utility/PublicRoutes";
import RequireWorkspace from "./utility/RequireWorkspace";
import ConsumeToken from "./pages/workspace/ConsumeToken";

const Layout = lazy(() => import("./pages/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SelectWorkspace = lazy(() => import("./pages/workspace/SelectWorkspace"));

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
          element: (
            <RequireWorkspace>
              <Dashboard />
            </RequireWorkspace>
          ),
        },
        {
          path: "/select-workspace",
          element: <SelectWorkspace />,
        },
      ],
    },
    {
      path: "/auth/consume",
      element: <ConsumeToken />,
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
