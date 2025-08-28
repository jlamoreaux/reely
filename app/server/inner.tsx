"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.users.searchUsers>;
}) {
  const data = usePreloadedQuery(preloaded);
  
  return (
    <>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Reactive client-loaded data</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This data updates in real-time when changes occur in the database
        </p>
        <code>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </div>
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Users will appear here as they sign up</p>
      </div>
    </>
  );
}