import { useNavigate } from 'react-router-dom'
import Button from '../components/web/Button'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-16">
        <section className="w-full rounded-[3px] border border-white/8 bg-white/[0.03] px-8 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <svg fill="none" height={24} viewBox="0 0 24 24" width={24}>
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment successful</h1>
          <p className="mt-3 text-sm text-white/50">
            Your appointment has been booked. You'll receive a confirmation shortly.
          </p>
          <div className="mt-8">
            <Button onClick={() => navigate('/dashboard')} variant="solid">
              Back to dashboard
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
