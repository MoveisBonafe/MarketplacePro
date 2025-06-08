import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { githubStorage } from "./github-storage";

// Check if we're in static build mode (GitHub Pages)
const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === 'true' || 
                      (typeof window !== 'undefined' && window.location.hostname.includes('github.io'));

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If we're in static build mode, use GitHub storage instead of API calls
  if (isStaticBuild) {
    return handleStaticApiRequest(method, url, data);
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

async function handleStaticApiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  try {
    let result;
    
    if (url === '/api/auth/login' && method === 'POST') {
      const body = data as { username: string; password: string };
      const user = await githubStorage.getUserByUsername(body.username);
      if (user && user.password === body.password) {
        result = { user: { ...user, password: undefined } };
      } else {
        throw new Error('401: Invalid credentials');
      }
    } else if (url === '/api/categories') {
      if (method === 'GET') {
        result = await githubStorage.getCategories();
      } else if (method === 'POST') {
        result = await githubStorage.createCategory(data as any);
      }
    } else if (url.startsWith('/api/categories/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updateCategory(id, data as any);
    } else if (url.startsWith('/api/categories/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deleteCategory(id);
      result = { success: true };
    } else if (url === '/api/colors') {
      if (method === 'GET') {
        result = await githubStorage.getColors();
      } else if (method === 'POST') {
        result = await githubStorage.createColor(data as any);
      }
    } else if (url.startsWith('/api/colors/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updateColor(id, data as any);
    } else if (url.startsWith('/api/colors/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deleteColor(id);
      result = { success: true };
    } else if (url === '/api/products') {
      if (method === 'GET') {
        result = await githubStorage.getProducts();
      } else if (method === 'POST') {
        result = await githubStorage.createProduct(data as any);
      }
    } else if (url.startsWith('/api/products/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updateProduct(id, data as any);
    } else if (url.startsWith('/api/products/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deleteProduct(id);
      result = { success: true };
    } else if (url === '/api/pricing-tables') {
      if (method === 'GET') {
        result = await githubStorage.getPricingTables();
      } else if (method === 'POST') {
        result = await githubStorage.createPricingTable(data as any);
      }
    } else if (url.startsWith('/api/pricing-tables/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updatePricingTable(id, data as any);
    } else if (url.startsWith('/api/pricing-tables/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deletePricingTable(id);
      result = { success: true };
    } else if (url === '/api/promotions') {
      if (method === 'GET') {
        result = await githubStorage.getPromotions();
      } else if (method === 'POST') {
        result = await githubStorage.createPromotion(data as any);
      }
    } else if (url.startsWith('/api/promotions/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updatePromotion(id, data as any);
    } else if (url.startsWith('/api/promotions/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deletePromotion(id);
      result = { success: true };
    } else if (url === '/api/announcements') {
      if (method === 'GET') {
        result = await githubStorage.getAnnouncements();
      } else if (method === 'POST') {
        result = await githubStorage.createAnnouncement(data as any);
      }
    } else if (url.startsWith('/api/announcements/') && method === 'PUT') {
      const id = parseInt(url.split('/')[3]);
      result = await githubStorage.updateAnnouncement(id, data as any);
    } else if (url.startsWith('/api/announcements/') && method === 'DELETE') {
      const id = parseInt(url.split('/')[3]);
      await githubStorage.deleteAnnouncement(id);
      result = { success: true };
    } else {
      throw new Error(`404: Endpoint not found: ${url}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    const status = error.message.startsWith('401') ? 401 : 
                   error.message.startsWith('404') ? 404 : 500;
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    if (isStaticBuild) {
      const res = await handleStaticApiRequest('GET', queryKey[0] as string);
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      await throwIfResNotOk(res);
      return await res.json();
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
