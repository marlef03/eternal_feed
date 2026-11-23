import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostList from "./components/PostList";
import Profile from "./components/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
      retry: 2,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-lg:h-10 h-0 transition-all" />
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <PostList />
        </div>
      </div>
      <Profile />
    </QueryClientProvider>
  );
}

export default App;
