import { apiBaseUrl } from '../auth-config'
import { useCloudflareApi } from './useCloudflareApi'

const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '')

export function usePaymentApi() {
  const { doPost } = useCloudflareApi()

  async function createPaymentIntent(priceId: string) {
    const response = await doPost(`${normalizedApiBaseUrl}/api/payments/create-intent`, { priceId })
    const result = await response.json() as { clientSecret?: string; error?: string }
    if (!response.ok || !result.clientSecret) {
      throw new Error(result.error ?? 'Failed to create payment intent.')
    }
    return result.clientSecret
  }

  return { createPaymentIntent }
}
