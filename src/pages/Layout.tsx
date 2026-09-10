import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { rootOrigin } from "../utility/origin";

const Layout = () => {
  const { logOut } = useUser();

  return (
    <div>
      <header className="flex items-center justify-between bg-green-300 px-10">
        <span>Header</span>
        <span className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              window.location.assign(`${rootOrigin()}/select-workspace`)
            }
          >
            Switch workspace
          </button>
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
