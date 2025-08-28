import Home from "./inner";
import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function ServerPage() {
  // Using the users query instead of the removed myFunctions
  const preloaded = await preloadQuery(api.users.searchUsers, {
    searchTerm: "",
    limit: 3,
  });

  const data = preloadedQueryResult(preloaded);

  return (
    <main className="p-8 flex flex-col gap-4 mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold text-center">Reelly - Server Demo</h1>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Server-loaded Users</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This demonstrates server-side data loading with Convex
        </p>
        <code>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </div>
      <Home preloaded={preloaded} />
    </main>
  );
}