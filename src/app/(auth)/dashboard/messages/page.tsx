'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { notFound } from 'next/navigation'
import Drawer from '../components/drawer'
import Link from 'next/link'
import { EnvelopeIcon, MegaphoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { markAsRead } from '../actions/markAsRead'
import CreateMessageModal from '../components/CreateMessageModal'

export default async function Messages() {
  const VENUE_TIMEZONE = 'America/Chicago'

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const formatDate = (isoString: string, options: any) => {
    return new Date(isoString).toLocaleString('en-US', {
      ...options,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) return notFound()

  const isManager = user.position === 'manager'

  let messages: any[] = []
  let drivers: any[] = []

  try {
    const [messagesRes, driversRes] = await Promise.all([
      payload.find({
        collection: 'messages',
        where: {
          or: [
            {
              sendToAll: {
                equals: true,
              },
            },
            {
              driver: {
                contains: user.id,
              },
            },
          ],
        },
        select: {
          message: true,
          sender: true,
          type: true,
          subject: true,
          createdAt: true,
          id: true,
          sendToAll: true,
          readBy: true,
        },
        overrideAccess: true,
        depth: 1,
        user: user,
      }),

      isManager
        ? payload.find({
            collection: 'drivers',
            limit: 100,
            overrideAccess: true,
          })
        : Promise.resolve({ docs: [] }),
    ])

    drivers = driversRes.docs

    messages = messagesRes.docs.map((doc: any) => {
      const readByArray = Array.isArray(doc.readBy) ? doc.readBy : []

      const isRead = readByArray.some((r: any) => {
        const id = typeof r === 'object' && r !== null ? r.id : String(r)
        return String(id) === String(user.id)
      })

      const readByNames = readByArray
        .map((r: any) => {
          if (typeof r === 'object' && r !== null) {
            return r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email
          }
          return null
        })
        .filter(Boolean)

      return {
        message: doc.message,
        sender: doc.sender,
        type: doc.type,
        subject: doc.subject,
        createdAt: doc.createdAt,
        id: doc.id,
        isBroadcast: doc.sendToAll,
        isRead,
        readByNames,
      }
    })
  } catch (err) {
    console.error('Error fetching messages: ' + err)
    return notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50/50">

      {/* Main Page container */}
      <div className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {/* Header Dashboard section */}
          <div className="border-b border-slate-200 pb-6 mb-8 sm:flex sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Inbox
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                A list of all messages sent straight to your inbox from Vessel Management.
              </p>
            </div>

            {/* COMPOSE MESSAGE BUTTON FOR MANAGERS ONLY */}
            {isManager && (
              <div className="mt-4 sm:mt-0">
                <CreateMessageModal drivers={drivers} />
              </div>
            )}
          </div>

          <div className="flow-root">
            <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xs">
              {/* MOBILE VIEW */}
              <div className="block sm:hidden">
                <ul className="divide-y divide-slate-100">
                  {messages.map((message) => (
                    <li key={message.id} className={message.isRead ? 'opacity-85' : 'bg-sky-50/30'}>
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-x-4">
                          <Link
                            href={`?messageId=${message.id}`}
                            scroll={false}
                            className="font-semibold text-slate-900 text-sm line-clamp-1 hover:text-[#41a6f4]"
                          >
                            {!message.isRead && (
                              <span className="inline-block size-2 bg-[#41a6f4] rounded-full mr-2" />
                            )}
                            {message.subject}
                          </Link>
                          <span className="text-xs text-slate-400 whitespace-nowrap pt-0.5">
                            {formatDate(message.createdAt, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Read Receipts Tags (Mobile) */}
                        {message.readByNames.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                              Read by:
                            </span>
                            {message.readByNames.map((name: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100"
                              >
                                ✓ {name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-500 font-medium">
                            {message.sender?.fullName || message.sender?.email}
                          </span>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
                                message.isBroadcast
                                  ? 'bg-sky-50 text-[#41a6f4]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {message.isBroadcast ? (
                                <MegaphoneIcon className="size-3" />
                              ) : (
                                <EnvelopeIcon className="size-3" />
                              )}
                              {message.type || (message.isBroadcast ? 'Broadcast' : 'Direct')}
                            </span>

                            {!message.isRead && (
                              <form action={markAsRead.bind(null, message.id)}>
                                <button
                                  type="submit"
                                  className="text-xs font-bold text-[#41a6f4] hover:underline"
                                >
                                  Mark Read
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 table-fixed">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100">
                      <th
                        scope="col"
                        className="w-1/3 py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        Subject
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        Sender
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        Read Receipts
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 py-3.5 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        Status / Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className={`transition-colors group ${
                          message.isRead ? 'hover:bg-slate-50/60' : 'bg-sky-50/20 font-bold'
                        }`}
                      >
                        {/* Subject */}
                        <td className="py-4 pl-6 pr-3 text-sm text-slate-900 truncate">
                          <div className="flex items-center gap-2">
                            {!message.isRead && (
                              <span className="size-2 rounded-full bg-[#41a6f4] shrink-0" />
                            )}
                            <Link
                              href={`?messageId=${message.id}`}
                              scroll={false}
                              className="hover:text-[#41a6f4] transition-colors truncate block"
                            >
                              {message.subject}
                            </Link>
                          </div>
                        </td>

                        {/* Sender */}
                        <td className="px-3 py-4 text-sm text-slate-500 truncate">
                          {message.sender?.fullName || 'System Notification'}
                        </td>

                        {/* Read By Drivers List */}
                        <td className="px-3 py-4 text-sm">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {message.readByNames.length > 0 ? (
                              message.readByNames.map((name: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100"
                                >
                                  ✓ {name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unread</span>
                            )}
                          </div>
                        </td>

                        {/* Message Type */}
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide ${
                              message.isBroadcast
                                ? 'bg-sky-50 text-[#41a6f4]'
                                : 'bg-slate-50 border border-slate-200 text-slate-600'
                            }`}
                          >
                            {message.isBroadcast ? (
                              <MegaphoneIcon className="size-3.5" />
                            ) : (
                              <EnvelopeIcon className="size-3.5" />
                            )}
                            {message.type || (message.isBroadcast ? 'Broadcast' : 'Direct')}
                          </span>
                        </td>

                        {/* Received & Action */}
                        <td className="py-4 pl-3 pr-6 text-sm text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-slate-400">
                              {formatDate(message.createdAt, { month: 'short', day: 'numeric' })}
                            </span>

                            {message.isRead ? (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-normal">
                                <CheckCircleIcon className="size-4 text-emerald-500" />
                                Read
                              </span>
                            ) : (
                              <form action={markAsRead.bind(null, message.id)}>
                                <button
                                  type="submit"
                                  className="text-xs font-bold text-[#41a6f4] hover:bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg transition-all"
                                >
                                  Mark as Read
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {messages.length === 0 && (
                <div className="text-center py-12 px-4">
                  <EnvelopeIcon className="mx-auto size-10 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">No messages</h3>
                  <p className="mt-1 text-sm text-slate-400">Your inbox is clear right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Drawer messages={messages} />
    </div>
  )
}
