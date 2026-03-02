'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface QRDisplayProps {
  value: string
}

export default function QRDisplay({ value }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error)
        }
      )
    }
  }, [value])

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-blue-500/30 inline-block">
        <canvas ref={canvasRef} className="rounded-2xl w-80 h-80" style={{ width: '320px', height: '320px' }} />
      </div>

      <div className="flex items-center gap-3 bg-blue-500/10 px-6 py-3 rounded-2xl border-2 border-blue-500/30">
        <span className="text-sm text-blue-400 font-bold uppercase tracking-wider">PIN del Juego:</span>
        <span className="text-5xl font-black text-blue-500 tracking-widest">
          {value.split('/').pop()}
        </span>
      </div>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-500/50"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? '¡ENLACE COPIADO!' : 'COPIAR ENLACE DE UNIÓN'}
      </button>
    </div>
  )
}
