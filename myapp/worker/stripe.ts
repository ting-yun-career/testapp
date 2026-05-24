import Stripe from 'stripe'

type StripeEnv = {
  STRIPE_SECRET_KEY: string
}

export async function createPaymentIntent(request: Request, env: StripeEnv): Promise<Response> {
  const body = await request.json() as { priceId?: string }

  if (!body.priceId) {
    return Response.json({ error: 'priceId is required.' }, { status: 400 })
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const price = await stripe.prices.retrieve(body.priceId)

  if (!price.unit_amount) {
    return Response.json({ error: 'Invalid price.' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: price.unit_amount,
    currency: price.currency,
    metadata: { priceId: body.priceId },
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}
