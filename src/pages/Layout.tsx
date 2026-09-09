import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Layout = () => {
  const { user, setUser } = useUser();

  return (
    <div>
      <header className="flex items-center justify-between bg-green-300 px-10">
        <span>Header</span>
        <span className="flex items-center gap-4">
          {user?.email}
          <button type="button" onClick={() => setUser(null)}>
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
