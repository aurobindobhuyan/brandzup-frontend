import { useWorkspace } from "./workspace/WorkspaceContainer";

const Dashboard = () => {
  const workspace = useWorkspace();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">{workspace.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {workspace.description || "No description"}
      </p>
      <p className="mt-4 text-xs text-gray-400">ID: {workspace.nanoId}</p>
    </div>
  );
};

export default Dashboard;
