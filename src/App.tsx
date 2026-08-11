import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';

// Initialize React Query Client with performance staletime rules matching Section 90.5
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds staleTime for standard feeds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <RouterProvider router={router} />
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
