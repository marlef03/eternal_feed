import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostList from './components/PostList';
import PostForm from './components/PostForm';

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
      <div
        className="flex flex-col items-center"
      >
        <div
          className="w-full max-w-2xl"
        >
          <PostForm />
          <PostList />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;