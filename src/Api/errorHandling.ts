// errorHandling.ts
export function handleApiError(error: any) {
    console.error('API call error:', error);
    throw error;
  }
