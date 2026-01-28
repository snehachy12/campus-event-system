"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'

interface MentorMessage { role: 'assistant' | 'user'; text: string }

interface UseVapiReturn {
  volumeLevel: number
  isCallActive: boolean
  isLoading: boolean
  messages: MentorMessage[]
  toggleCall: () => Promise<void>
}

export function useVapi(assistantId?: string): UseVapiReturn {
  const vapiRef = useRef<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [messages, setMessages] = useState<MentorMessage[]>([])

  const init = useCallback(async () => {
    if (vapiRef.current) return
    setIsLoading(true)
    try {
      const resp = await fetch('/api/vapi/ephemeral-key', { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed key fetch')
      vapiRef.current = new Vapi(data.key)

      // Volume / audio energy (SDK event naming may differ; adjust as needed)
      vapiRef.current.on?.('volume', (lvl: number) => {
        setVolumeLevel(typeof lvl === 'number' ? lvl : 0)
      })

      // Speech / transcript like events
      vapiRef.current.on?.('speech', (evt: any) => {
        if (!evt?.text) return
        setMessages(m => [...m, { role: evt.role === 'agent' ? 'assistant' : 'user', text: evt.text }])
      })

      // Simple status binding
      vapiRef.current.on?.('status', (s: string) => {
        if (s === 'connected') setIsCallActive(true)
        if (s === 'disconnected') setIsCallActive(false)
      })
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', text: 'Init error: ' + e.message }])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const start = useCallback(async () => {
    await init()
    if (!assistantId) {
      const aid = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      assistantId = aid
    }
    if (!assistantId) {
      setMessages(m => [...m, { role: 'assistant', text: 'Missing assistant id' }])
      return
    }
    try {
      setIsLoading(true)
      await vapiRef.current?.start(assistantId)
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', text: 'Start error: ' + e.message }])
    } finally {
      setIsLoading(false)
    }
  }, [init, assistantId])

  const stop = useCallback(async () => {
    try { await vapiRef.current?.stop() } catch {}
  }, [])

  const toggleCall = useCallback(async () => {
    if (isCallActive) {
      await stop()
    } else {
      await start()
    }
  }, [isCallActive, start, stop])

  useEffect(() => () => { vapiRef.current?.stop() }, [])

  return { volumeLevel, isCallActive, isLoading, messages, toggleCall }
}

export default useVapi
