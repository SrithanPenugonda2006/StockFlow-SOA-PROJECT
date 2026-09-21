export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function extractErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred';
  if (typeof err === 'string') return err;
  if (typeof err.response?.data === 'string') return err.response.data;
  if (typeof err.response?.data?.message === 'string') return err.response.data.message;
  if (typeof err.response?.data?.error === 'string') return err.response.data.error;
  if (typeof err.message === 'string') return err.message;
  return 'Failed to complete request';
}
