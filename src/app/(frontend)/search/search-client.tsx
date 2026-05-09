'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchInput() {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set('q', value)
      else next.delete('q')
      router.replace(`/search?${next.toString()}`)
    }, 250)
    return () => clearTimeout(handle)
  }, [value, params, router])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search posts and projects..."
        className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 focus:ring-1 focus:ring-accent-blue/20 transition-all"
      />
    </div>
  )
}
