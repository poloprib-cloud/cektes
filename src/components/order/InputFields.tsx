'use client'
import React, { useEffect, useState } from 'react'
import { getCountryDisplay } from '@/lib/get-country-display'

interface InputFieldsProps {
  gameConfig: {
    required_inputs: string[]
    input_fields: {
      name: string
      label: string
      placeholder: string
      type?: string
    }[]
    options?: { value: string; label: string }[]
    code_validation_nickname?: string
  }
  inputs: Record<string, string>
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
  idRef?: React.RefObject<HTMLDivElement>
  serverRef?: React.RefObject<HTMLDivElement>
}

const normalizeNickname = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.replace(/\+/g, '').trim()
}

const normalizeRegion = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.replace(/\+/g, '').replace(/\s+/g, ' ').trim()
}

const InputFields: React.FC<InputFieldsProps> = ({
  gameConfig,
  inputs,
  handleInputChange,
  idRef,
  serverRef,
}) => {
  const [nickname, setNickname] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = inputs['id']
    const server = inputs['server']

    if (gameConfig?.code_validation_nickname === 'ml' && id && server) {
      const debounce = setTimeout(() => {
        validateNickname(id, server)
      }, 500)

      return () => clearTimeout(debounce)
    }
  }, [inputs, gameConfig?.code_validation_nickname])

  const validateNickname = async (id: string, server: string) => {
    setLoading(true)
    setError(null)
    setNickname(null)
    setCountry(null)

    try {
      const res = await fetch('/api/validate-mlbb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, server }),
      })

      const data = await res.json()
      const cleanedNickname = normalizeNickname(data?.nickname)
      const cleanedCountry = normalizeRegion(data?.country)

      if (res.ok && cleanedNickname) {
        setNickname(cleanedNickname)
        setCountry(cleanedCountry || null)
      } else {
        setNickname(null)
        setCountry(null)
        setError(data?.error || 'Nickname tidak ditemukan.')
      }
    } catch (err) {
      setNickname(null)
      setCountry(null)
      setError('Gagal memvalidasi ID. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (!gameConfig || !gameConfig.required_inputs) return null

  const commonClassNames =
    'w-full rounded-lg border-0 bg-muted px-4 py-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-my-color'

  return (
    <>
      {gameConfig.required_inputs.map((inputName, index) => {
        const field = gameConfig.input_fields.find((f) => f.name === inputName)
        const ref =
          inputName === 'id' ? idRef : inputName === 'server' ? serverRef : null
        const isDropdown =
          inputName === 'server' && (gameConfig.options?.length || 0) > 0

        const label =
          field?.label || inputName.charAt(0).toUpperCase() + inputName.slice(1)
        const placeholder = field?.placeholder || `Masukkan ${label}`
        const type = field?.type || 'text'

        return (
          <div key={`${inputName}-${index}`} ref={ref} className="space-y-1">
            <label
              htmlFor={inputName}
              className="block text-xs font-semibold text-card-foreground"
            >
              {label}
            </label>

            {isDropdown ? (
              <select
                id={inputName}
                name={inputName}
                value={inputs[inputName] || ''}
                onChange={handleInputChange}
                className={commonClassNames}
              >
                <option value="">Pilih {label}</option>
                {gameConfig.options!.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                id={inputName}
                name={inputName}
                placeholder={placeholder}
                autoComplete={inputName}
                value={inputs[inputName] || ''}
                onChange={handleInputChange}
                className={commonClassNames}
              />
            )}
          </div>
        )
      })}

      <div className="col-span-2">
        {loading && (
          <div className="w-full inline-flex items-center gap-2 rounded-lg border border-muted-foreground/30 bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
            <span>Mengecek akun...</span>
          </div>
        )}

        {!loading && nickname && !error && (
          <div className="w-full rounded-lg border border-green-600/70 bg-green-900/20 px-3 py-2 text-xs">
            <span className="inline-flex w-full items-center justify-center gap-2">
              <strong className="text-green-400">{nickname}</strong>
              <span>✅</span>
              <span className="text-muted-foreground">•</span>
              <strong className="text-foreground">
                {country ? getCountryDisplay(country) : '-'}
              </strong>
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="w-full rounded-lg border border-red-600/70 bg-red-900/20 px-3 py-2 text-xs text-red-400">
            <div className="flex items-center justify-between gap-2">
              <span>ID tidak valid ❌</span>
              <span className="text-red-300/80">Cek lagi ID & Server</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default InputFields