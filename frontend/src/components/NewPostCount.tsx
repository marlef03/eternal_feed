import { formNewPostMessage } from "../util/helperFunctions";
import Transition from "./Transition";

function NewPostCount({
  count,
  fetchNewPosts,
}: {
  count: number;
  fetchNewPosts: () => void;
}) {
  function onPush() {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
    });

    fetchNewPosts();
  }

  return (
    <Transition
      appear={count > 0}
      onAppearStyle={{
        top: "0px",
        transitionProperty: "top",
      }}
      onDisappearStyle={{
        top: "-80px",
        transitionProperty: "top",
      }}
      duration={500}
      className="
        fixed
        top-0
        text-center
        bg-mist-100
        dark:bg-mist-800
        border
        border-mist-400
        rounded-xl
        dark:border-mist-600
        p-1
        shadow-md
        mt-2
      "
    >
      <button onClick={onPush}>{formNewPostMessage(count)}</button>
    </Transition>
  );
}

export default NewPostCount;
