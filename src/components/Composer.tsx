import './Composer.css'

type ComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  sending: boolean
  placeholder?: string
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13V3M3 7l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Composer({ value, onChange, onSend, sending, placeholder }: ComposerProps) {
  return (
    <div className="composer">
      <textarea
        className="composer-input"
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder ?? 'How can I help you today?'}
        disabled={sending}
      />
      <button
        className="composer-send"
        onClick={onSend}
        disabled={sending || !value.trim()}
        aria-label="Send"
      >
        <SendIcon />
      </button>
    </div>
  )
}
