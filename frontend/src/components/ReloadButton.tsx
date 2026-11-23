import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

async function reload(
  queryClient: QueryClient,
  queryKey: (string | number)[],
  setIsUpdating: (isUpdating: boolean) => void,
) {
  setIsUpdating(true);
  await queryClient.resetQueries({ queryKey: queryKey });
  setIsUpdating(false);
}

function ReloadButton({ queryKey }: { queryKey: (string | number)[] }) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (isUpdating) {
      setAngle(angle + 0.0001);
    } else if (!isUpdating && angle > 0) {
      setAngle(0);
    }
  }, [angle, isUpdating]);

  return (
    <button
      title="Обновить стену"
      className="
        fixed
        right-34.5
        top-0
        w-10
        h-10
        mt-1
        cursor-pointer
        bg-mist-100
        dark:bg-mist-800 
        hover:bg-mist-200
        dark:hover:bg-mist-700
        border 
        border-mist-400 
        rounded-4xl
        dark:border-mist-600 
        p-2 
        mb-1 
        shadow-md
        transition-all
      "
      type="button"
      onClick={async () => await reload(queryClient, queryKey, setIsUpdating)}
    >
      <div
        className="flex justify-center items-center"
        style={{
          rotate: `${angle}rad`,
        }}
      >
        <ArrowPathIcon className="size-6" />
      </div>
    </button>
  );
}

export default ReloadButton;
