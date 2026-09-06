import { useServers } from "../hooks/useServers";

export function ServerList() {
  const { data: servers, isLoading, error } = useServers();

  if (isLoading) return <p>Loading servers...</p>;
  if (error) return <p className="text-red-500">Failed to load servers</p>;

  return (
    <ul className="flex flex-col gap-2">
      {servers && servers.length > 0 ? (
        <>
          <li>Your Servers:</li>
          {servers.map((server) => (
            <li key={server.id} className="rounded border px-3 py-2">
              {server.name} - {server.inviteCode}
            </li>
          ))}
        </>
      ) : (
        <li>You haven't joined any servers</li>
      )}
    </ul>
  );
}
