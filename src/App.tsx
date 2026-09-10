import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoutes from "./utility/ProtectedRoutes";
import PublicRoutes from "./utility/PublicRoutes";
import WorkspaceGate from "./utility/WorkspaceGate";

const Layout = lazy(() => import("./pages/Layout"));
const SelectWorkspace = lazy(() => import("./pages/workspace/SelectWorkspace"));
const ConsumeToken = lazy(() => import("./pages/workspace/ConsumeToken"));
const WorkspaceContainer = lazy(
  () => import("./pages/workspace/WorkspaceContainer"),
);
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        // Verifies if the User is LoggedIn or not else redirect to /login
        <ProtectedRoutes>
          <Layout />
        </ProtectedRoutes>
      ),
      children: [
        {
          path: "/select-workspace",
          element: <SelectWorkspace />,
        },
        {
          index: true,
          element: (
            // Verifies the session's workspace matches this origin, else sends
            // the user back to the root to select one. The container then
            // loads that workspace's details for everything underneath.
            <WorkspaceGate>
              <WorkspaceContainer>
                <Dashboard />
              </WorkspaceContainer>
            </WorkspaceGate>
          ),
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
