'use client'

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Form } from '@/payload-types'

type FormField = {
  blockType: 'text' | 'textarea' | 'email' | 'number' | 'checkbox' | 'select'
  blockName?: string
  name: string
  label?: string
  required?: boolean
  defaultValue?: string | number | boolean
  options?: Array<{ label: string; value: string }>
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm({ form }: { form: Form }) {
  const fields = (form.fields ?? []) as unknown as FormField[]
  const [values, setValues] = useState<Record<string, string | boolean | number>>(() =>
    Object.fromEntries(
      fields.map((f) => [f.name, typeof f.defaultValue === 'boolean' ? f.defaultValue : (f.defaultValue ?? '')]),
    ),
  )
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const setValue = (name: string, value: string | boolean | number) =>
    setValues((s) => ({ ...s, [name]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      const submissionData = fields.map((f) => ({
        field: f.name,
        value: values[f.name] ?? '',
      }))
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.id, submissionData }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message ?? 'Submission failed')
      }
      setStatus('success')
      setValues((s) => Object.fromEntries(Object.keys(s).map((k) => [k, ''])))
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  const renderField = (f: FormField) => {
    const id = `field-${f.name}`
    const v = values[f.name]
    const labelText = f.label ?? f.name
    const baseInput =
      'w-full px-4 py-3 bg-bg-tertiary border border-border-primary rounded-lg font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30 focus:ring-1 focus:ring-accent-blue/20 transition-all'

    if (f.blockType === 'textarea') {
      return (
        <div key={f.name}>
          <label htmlFor={id} className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
            {labelText}
          </label>
          <textarea
            id={id}
            value={String(v ?? '')}
            onChange={(e) => setValue(f.name, e.target.value)}
            required={f.required}
            rows={5}
            className={`${baseInput} resize-none`}
          />
        </div>
      )
    }
    if (f.blockType === 'checkbox') {
      return (
        <div key={f.name} className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => setValue(f.name, e.target.checked)}
            required={f.required}
          />
          <label htmlFor={id} className="font-mono text-xs text-text-muted">
            {labelText}
          </label>
        </div>
      )
    }
    if (f.blockType === 'select') {
      return (
        <div key={f.name}>
          <label htmlFor={id} className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
            {labelText}
          </label>
          <select
            id={id}
            value={String(v ?? '')}
            onChange={(e) => setValue(f.name, e.target.value)}
            required={f.required}
            className={baseInput}
          >
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )
    }
    const inputType =
      f.blockType === 'email' ? 'email' : f.blockType === 'number' ? 'number' : 'text'
    return (
      <div key={f.name}>
        <label htmlFor={id} className="block font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
          {labelText}
        </label>
        <input
          id={id}
          type={inputType}
          value={String(v ?? '')}
          onChange={(e) => setValue(f.name, e.target.value)}
          required={f.required}
          className={baseInput}
        />
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="card-surface p-6 space-y-5"
    >
      {fields.map(renderField)}

      {status === 'success' && (
        <div className="flex items-center gap-2 text-accent-green font-mono text-sm py-3">
          <CheckCircle className="w-4 h-4" />
          Message sent! I&apos;ll get back to you soon.
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 font-mono text-sm py-3">
          <AlertCircle className="w-4 h-4" />
          {errorMessage || 'Something went wrong.'}
        </div>
      )}
      {status !== 'success' && (
        <Button type="submit" size="lg" className="w-full" disabled={status === 'submitting'}>
          <Send className="w-4 h-4" />
          {status === 'submitting' ? 'Sending…' : 'Send Message'}
        </Button>
      )}
    </motion.form>
  )
}
