'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { Driver } from '@/payload-types'

interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  success?: boolean
  error?: string
}

export type Result = {
  exp?: number
  token?: string
  user?: Driver
}

export async function login({ username, password }: LoginParams): Promise<LoginResponse> {
  const payload = await getPayload({ config })
  try {
    const result: Result = await payload.login({
      collection: 'drivers',
      data: { username, password },
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        path: '/',
      })
    }

    return { success: true }
  } catch (error) {
    console.log('Login Error', error)
    return { success: false, error: `${error}` }
  }
}
