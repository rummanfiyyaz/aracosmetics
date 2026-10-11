'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { IconClose, IconPlus } from '@/components/icons'
import { useToast } from '@/context/ToastContext'

export function ImageInput({
  label,
  hint,
  value,
  onChange,
  error,
  aspectClass = 'aspect-video',
}: {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  error?: string
  aspectClass?: string
}) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const uploadEnabled = Boolean(cloudName && uploadPreset)

  const uploadFile = async (file: File) => {
    if (!uploadEnabled) {
      toast({
        title: 'Image upload not configured',
        description:
          'Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
        variant: 'error',
      })
      return
    }
    setUploading(true)
    try {
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const body = new FormData()
      body.append('file', file)
      body.append('upload_preset', uploadPreset!)
      const res = await fetch(endpoint, { method: 'POST', body })
      if (!res.ok) throw new Error(`Cloudinary rejected ${file.name}`)
      const json = (await res.json()) as { secure_url?: string }
      if (!json.secure_url) throw new Error(`No URL returned for ${file.name}`)
      onChange(json.secure_url)
      toast({ title: 'Image uploaded' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast({ title: 'Upload failed', description: message, variant: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
      />
      {value ? (
        <div
          className={`group relative overflow-hidden rounded-xl bg-ink-50 ${aspectClass}`}
        >
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !uploadEnabled}
              className="bg-white/95"
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </Button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-700 shadow"
              aria-label="Remove image"
            >
              <IconClose width={14} height={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !uploadEnabled}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 p-6 text-sm text-ink-500 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60 ${aspectClass}`}
          title={
            uploadEnabled
              ? undefined
              : 'Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
          }
        >
          <IconPlus width={20} height={20} />
          <span>{uploading ? 'Uploading…' : 'Upload image'}</span>
        </button>
      )}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}
