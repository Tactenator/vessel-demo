'use client'

import React, { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, LoginResponse } from './actions/login'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const result: LoginResponse = await login({ username, password })

    setIsPending(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Branding Hub */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          alt="Vessel"
          src="/vessel-network.jpg"
          className="mx-auto h-16 w-auto object-contain drop-shadow-2xs"
        />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Access your fleet tracking and logistics terminal
        </p>
      </div>

      {/* Main Interactive Login Node Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white px-6 py-10 border border-slate-200 shadow-sm rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Inline Graceful Error Alert Notification Block */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 border border-rose-100 text-rose-800 text-xs font-medium animate-fade-in">
                <ExclamationTriangleIcon className="size-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <strong className="block font-bold mb-0.5">Authentication Failed</strong>
                  <p className="text-rose-700/90 leading-normal">{error}</p>
                </div>
              </div>
            )}

            {/* Username Entry Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                onChange={() => setError(null)}
                required
                placeholder="Enter your workspace username"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4]"
              />
            </div>

            {/* Password Entry Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-400 uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-[#41a6f4] hover:text-[#3592dd] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                onChange={() => setError(null)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4]"
              />
            </div>

            {/* Submit Trigger Execution Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#41a6f4] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3592dd] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41a6f4] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs text-sm"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing you in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Alternate Navigation Footer Links */}
        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Need secondary portal access?{' '}
          <Link
            href="/admin"
            className="font-bold text-[#41a6f4] hover:text-[#3592dd] transition-colors underline decoration-2 underline-offset-4"
          >
            Admin Management Console
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
