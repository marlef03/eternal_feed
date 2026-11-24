import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  type Query,
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

function buildPredicate(queryKeys: ((string | number)[] | string)[]) {
  return (query: Query) =>
    queryKeys.some((key) => {
      if (Array.isArray(key)) {
        return (
          key.length === query.queryKey.length &&
          key.every((v, i) => v === query.queryKey[i])
        );
      }
      return key === query.queryKey[0];
    });
}

async function reload(
  queryClient: QueryClient,
  queryKeys: ((string | number)[] | string)[],
  setIsUpdating: (isUpdating: boolean) => void,
) {
  setIsUpdating(true);
  try {
    const predicate = buildPredicate(queryKeys);

    await queryClient.resetQueries({ predicate });

    const pending = queryClient
      .getQueryCache()
      .findAll({ predicate })
      .map((q) => q.promise)
      .filter((p): p is Promise<void> => Boolean(p));

    await Promise.all(pending);
  } finally {
    setIsUpdating(false);
  }
}

function ReloadButton({
  queryKeys,
  className,
  title,
}: {
  queryKeys: ((string | number)[] | string)[];
  className: string;
  title: string;
}) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!isUpdating) return;
    let raf: number;
    const tick = () => {
      setAngle((a) => a + 0.05);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isUpdating]);

  useEffect(() => {
    if (!isUpdating) setAngle(0);
  }, [isUpdating]);

  return (
    <button
      title={title}
      disabled={isUpdating}
      className={`
        ${className}
        cursor-pointer
        disabled:cursor-default
        bg-mist-100
        dark:bg-mist-800
        enabled:hover:bg-mist-200
        enabled:dark:hover:bg-mist-700
        border
        border-mist-400
        rounded-4xl
        dark:border-mist-600
        p-2
        shadow-md
        transition-all
      `}
      type="button"
      onClick={() => reload(queryClient, queryKeys, setIsUpdating)}
    >
      <div
        className="flex justify-center items-center"
        style={{
          rotate: `${angle}rad`,
        }}
      >
        <ArrowPathIcon className="size-full" />
      </div>
    </button>
  );
}

export default ReloadButton;
