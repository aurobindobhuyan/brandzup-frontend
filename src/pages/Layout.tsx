import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getHostWorkspaceId, goToRoot } from "../utility/host";

const Layout = () => {
  const { user, logOut } = useUser();
  const onWorkspaceHost = Boolean(getHostWorkspaceId());

  return (
    <div>
      <header className="flex items-center justify-between bg-green-300 px-10">
        <span>Header</span>
        <span className="flex items-center gap-4">
          {user?.email}
          {onWorkspaceHost && (
            <button type="button" onClick={() => goToRoot("/select-workspace")}>
              Switch workspace
            </button>
          )}
          <button type="button" onClick={logOut}>
            Sign out
          </button>
        </span>
      </header>
      <Outlet />
      <footer className="bg-amber-300 px-10 ">Footer</footer>
    </div>
  );
};

export default Layout;
