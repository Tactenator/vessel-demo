'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  HomeIcon,
  CalendarDaysIcon,
  XMarkIcon,
  EnvelopeIcon,
  PowerIcon,
  Bars3Icon,
  TruckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  MapIcon,
} from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { getUnreadCount } from '../actions/getUnreadCount'

// Base routes accessible by everyone
const baseNavigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: GlobeAltIcon },
  { name: 'Schedule', href: '/dashboard/schedule', icon: CalendarDaysIcon },
  { name: 'My Messages', href: '/dashboard/messages', icon: EnvelopeIcon },
  { name: 'Vehicle Info', href: '/dashboard/expenditures', icon: CurrencyDollarIcon },
  { name: 'Deliveries', href: '/dashboard/routes', icon: TruckIcon },
]

// Restricted routes visible to verified managers and assistants
const managerNavigation = [
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
  { name: 'All Drives Management', href: '/dashboard/jobs', icon: ClipboardDocumentListIcon },
  { name: 'All Drivers', href: '/dashboard/drivers', icon: UserGroupIcon },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPinIcon },
  { name: 'All Vehicles', href: '/dashboard/vehicles', icon: WrenchScrewdriverIcon },
  // { name: 'Live Tracking', href: '/dashboard/tracking', icon: MapIcon },
]

// How often to silently renew the session while the driver is active.
// Well under the 24h token lifetime set in the Drivers collection auth config,
// so an active driver never gets logged out mid-shift, but a stolen/idle
// token still expires on its own within a day if refreshes stop happening.
const TOKEN_REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

// Sidebar now lives in the dashboard layout and stays mounted across
// navigations, so the unread badge needs its own poll to stay fresh instead
// of piggybacking on route changes.
const UNREAD_POLL_INTERVAL_MS = 60 * 1000 // 1 minute

async function refreshToken() {
  try {
    const res = await fetch('/api/drivers/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      console.error('Failed to refresh token')
    }
  } catch (err) {
    console.error('Failed to refresh token', err)
  }
}

async function handleLogOut() {
  const res = await fetch('/api/drivers/logout?allSessions=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (res.ok) {
    window.location.href = '/'
  } else {
    console.error('Failed to log out')
  }
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarProps {
  // Resolved once, server-side, by the dashboard layout — avoids a client
  // round trip (and the flash while it resolves) just to decide whether to
  // show the manager section, and never needs re-checking on navigation
  // since the layout — and this prop — persist for the session.
  hasManagementView: boolean
}

export default function Sidebar({ hasManagementView }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const pathname = usePathname()

  // Sidebar is mounted once (from the dashboard layout) for the life of the session,
  // so the token refresh only needs to happen on mount — not on every navigation.
  useEffect(() => {
    refreshToken()

    const tokenInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL_MS)
    return () => clearInterval(tokenInterval)
  }, [])

  // The unread badge, on the other hand, needs to actually stay current while the
  // sidebar sits mounted, so it gets its own short poll.
  useEffect(() => {
    let cancelled = false
    async function refreshUnreadCount() {
      try {
        const count = await getUnreadCount()
        if (!cancelled) setUnreadCount(count)
      } catch (err) {
        console.error('Failed to refresh unread count:', err)
      }
    }
    refreshUnreadCount()

    const unreadInterval = setInterval(refreshUnreadCount, UNREAD_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(unreadInterval)
    }
  }, [])

  const mobileNavigation = hasManagementView
    ? [...baseNavigation, ...managerNavigation]
    : baseNavigation

  return (
    <>
      <div>
        {/* Mobile Sidebar Navigation */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-slate-900/40 transition-opacity duration-300 ease-linear data-closed:opacity-0 backdrop-blur-xs"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-slate-900" />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar Body */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-200">
                <div className="flex h-16 shrink-0 items-center">
                  <div className="h-8 w-8 rounded-lg bg-[#41a6f4] flex items-center justify-center font-bold text-white text-lg">
                    A
                  </div>
                  <span className="ml-3 font-semibold text-slate-900 text-lg tracking-tight">
                    Dashboard
                  </span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col justify-between">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {mobileNavigation.map((item) => {
                          const isCurrent = pathname === item.href
                          const isMessages = item.href === '/dashboard/messages'

                          return (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  isCurrent
                                    ? 'bg-sky-50 text-[#41a6f4] font-semibold shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200',
                                  'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 relative items-center justify-between',
                                )}
                              >
                                <div className="flex items-center gap-x-3 min-w-0">
                                  {isCurrent && (
                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#41a6f4]" />
                                  )}
                                  <item.icon
                                    aria-hidden="true"
                                    className={classNames(
                                      isCurrent
                                        ? 'text-[#41a6f4]'
                                        : 'text-slate-400 group-hover:text-slate-600',
                                      'size-5 shrink-0 transition-colors',
                                    )}
                                  />
                                  <span className="truncate">{item.name}</span>
                                </div>

                                {/* Mobile Message Unread Badge */}
                                {isMessages && unreadCount > 0 && (
                                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#41a6f4] text-white text-[10px] font-bold animate-pulse">
                                    {unreadCount}
                                  </span>
                                )}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                    <li className="-mx-2 pb-2">
                      <button
                        onClick={() => handleLogOut()}
                        className="w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium text-left"
                      >
                        <PowerIcon
                          aria-hidden="true"
                          className="size-5 shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors"
                        />
                        Logout
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-slate-50 border-r border-slate-200/80 px-6 pb-4">
            {/* Header/Logo */}
            <div className="flex h-20 shrink-0 items-center border-b border-slate-200/60">
              <div className="h-9 w-9 rounded-xl bg-[#41a6f4] flex items-center justify-center font-bold text-white text-xl shadow-md shadow-sky-200">
                <img className="rounded-xl" src="/sd-homecare-logo.png" alt="logo" />
              </div>
              <span className="ml-3 font-bold text-slate-800 text-lg tracking-tight">
                Dashboard
              </span>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col justify-between">
                <li>
                  {/* Standard Links */}
                  <ul role="list" className="-mx-2 space-y-1.5">
                    {baseNavigation.map((item) => {
                      const isCurrent = pathname === item.href
                      const isMessages = item.href === '/dashboard/messages'

                      return (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              isCurrent
                                ? 'bg-white text-[#41a6f4] font-semibold border border-slate-200/60 shadow-xs'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/40 hover:shadow-xs transition-all duration-200',
                              'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 relative items-center justify-between',
                            )}
                          >
                            <div className="flex items-center gap-x-3 min-w-0">
                              {isCurrent && (
                                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-[#41a6f4]" />
                              )}
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  isCurrent
                                    ? 'text-[#41a6f4]'
                                    : 'text-slate-400 group-hover:text-slate-600',
                                  'size-5 shrink-0 transition-colors',
                                )}
                              />
                              <span className="truncate">{item.name}</span>
                            </div>

                            {/* Unread Indicator Badge */}
                            {isMessages && unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#41a6f4] text-white text-[11px] font-bold shadow-xs ">
                                {unreadCount}
                              </span>
                            )}
                          </a>
                        </li>
                      )
                    })}
                  </ul>

                  {/* Dedicated Manager/Assistant Section */}
                  {hasManagementView && (
                    <div className="mt-8">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-3">
                        Management Control
                      </div>
                      <ul role="list" className="-mx-2 space-y-1.5">
                        {managerNavigation.map((item) => {
                          const isCurrent = pathname === item.href
                          return (
                            <li key={item.name}>
                              <a
                                href={item.href}
                                className={classNames(
                                  isCurrent
                                    ? 'bg-white text-[#41a6f4] font-semibold border border-slate-200/60 shadow-xs'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/40 hover:shadow-xs transition-all duration-200',
                                  'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 relative items-center',
                                )}
                              >
                                {isCurrent && (
                                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-[#41a6f4]" />
                                )}
                                <item.icon
                                  aria-hidden="true"
                                  className={classNames(
                                    isCurrent
                                      ? 'text-[#41a6f4]'
                                      : 'text-slate-400 group-hover:text-slate-600',
                                    'size-5 shrink-0 transition-colors',
                                  )}
                                />
                                {item.name}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </li>

                {/* Logout */}
                <li className="-mx-2 border-t border-slate-200/60 pt-4">
                  <button
                    onClick={() => handleLogOut()}
                    className="w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium text-left"
                  >
                    <PowerIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors"
                    />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Header Topbar */}
        <div className="sticky top-0 z-40 flex items-center justify-between gap-x-6 bg-white border-b border-slate-200 px-4 py-4 shadow-xs sm:px-6 lg:hidden">
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-slate-500 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
            <div className="text-sm font-semibold leading-6 text-slate-900">Dashboard</div>
          </div>

          {/* Topbar Unread Badge (Mobile) */}
          {unreadCount > 0 && (
            <a
              href="/dashboard/messages"
              className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-[#41a6f4] px-2.5 py-1 rounded-xl text-xs font-bold"
            >
              <EnvelopeIcon className="size-4" />
              <span>{unreadCount} unread</span>
            </a>
          )}
        </div>
      </div>
    </>
  )
}
