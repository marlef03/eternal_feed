import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostList from './components/PostList';

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
      <PostList />
    </QueryClientProvider>
  );
}

export default App;