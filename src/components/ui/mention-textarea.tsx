import React, { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  id?: string
  singleLine?: boolean
}

const MENTION_OPTIONS = [
  { key: 'username', label: '사용자 이름', value: '{@Username}' },
] as const

export function MentionTextarea({
  value,
  onChange,
  placeholder = '',
  maxLength,
  className,
  id,
  singleLine = false,
}: MentionTextareaProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const isInitialMount = useRef(true)
  const lastValueRef = useRef(value)

  // {@Username}을 칩 HTML로 변환
  const valueToHtml = useCallback((raw: string): string => {
    if (!raw) return ''
    return raw.replace(
      /\{@Username\}/g,
      '<span class="mention-chip" data-mention="username" contenteditable="false">사용자 이름</span>'
    )
  }, [])

  // HTML에서 raw 값으로 변환
  const htmlToValue = useCallback((element: HTMLElement): string => {
    let result = ''
    const walkNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent || ''
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (el.dataset.mention === 'username') {
          result += '{@Username}'
        } else if (el.tagName === 'BR') {
          if (!singleLine) result += '\n'
        } else if (el.tagName === 'DIV' && result.length > 0 && !result.endsWith('\n')) {
          if (!singleLine) result += '\n'
          el.childNodes.forEach(walkNodes)
        } else {
          el.childNodes.forEach(walkNodes)
        }
      }
    }
    element.childNodes.forEach(walkNodes)
    return result
  }, [singleLine])

  // 초기 마운트 시에만 HTML 설정
  useEffect(() => {
    if (!editorRef.current) return
    if (isInitialMount.current) {
      editorRef.current.innerHTML = valueToHtml(value)
      isInitialMount.current = false
      lastValueRef.current = value
    }
  }, [value, valueToHtml])

  // 외부에서 value가 변경된 경우 (예: reset)
  useEffect(() => {
    if (!editorRef.current || isInitialMount.current) return
    if (value === '' && lastValueRef.current !== '') {
      editorRef.current.innerHTML = ''
      lastValueRef.current = ''
    }
  }, [value])

  // 커서 위치에서 '@' 직전까지의 텍스트 확인
  const checkForMention = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const range = selection.getRangeAt(0)
    const container = range.startContainer

    if (container.nodeType !== Node.TEXT_NODE) return false

    const text = container.textContent || ''
    const cursorPos = range.startOffset
    const charBefore = text[cursorPos - 1]

    return charBefore === '@'
  }, [])

  // 드롭다운 위치 계산
  const calculateDropdownPosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current?.getBoundingClientRect()

    if (editorRect) {
      setDropdownPosition({
        top: rect.bottom - editorRect.top + 4,
        left: Math.max(0, rect.left - editorRect.left),
      })
    }
  }, [])

  // 멘션 칩 삽입
  const insertMention = useCallback(
    (mentionKey: string) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || !editorRef.current) return

      const range = selection.getRangeAt(0)
      const container = range.startContainer

      if (container.nodeType === Node.TEXT_NODE) {
        const text = container.textContent || ''
        const cursorPos = range.startOffset

        // '@' 삭제
        const beforeAt = text.substring(0, cursorPos - 1)
        const afterAt = text.substring(cursorPos)

        // 텍스트 노드 분할 및 칩 삽입
        const chip = document.createElement('span')
        chip.className = 'mention-chip'
        chip.dataset.mention = mentionKey
        chip.contentEditable = 'false'
        chip.textContent =
          MENTION_OPTIONS.find((opt) => opt.key === mentionKey)?.label || ''

        const parent = container.parentNode
        if (parent) {
          const beforeNode = document.createTextNode(beforeAt)
          const afterNode = document.createTextNode(afterAt)

          parent.insertBefore(beforeNode, container)
          parent.insertBefore(chip, container)
          parent.insertBefore(afterNode, container)
          parent.removeChild(container)

          // 커서를 칩 뒤로 이동
          const newRange = document.createRange()
          newRange.setStartAfter(chip)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }

      setShowDropdown(false)

      // onChange 트리거
      if (editorRef.current) {
        const newValue = htmlToValue(editorRef.current)
        lastValueRef.current = newValue
        onChange(newValue)
      }
    },
    [htmlToValue, onChange]
  )

  // 값 동기화
  const syncValue = useCallback(() => {
    if (!editorRef.current) return

    const newValue = htmlToValue(editorRef.current)

    // maxLength 체크
    if (maxLength && newValue.length > maxLength) {
      editorRef.current.innerHTML = valueToHtml(lastValueRef.current)
      return
    }

    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue
      onChange(newValue)
    }

    // '@' 감지
    if (checkForMention()) {
      calculateDropdownPosition()
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [htmlToValue, maxLength, valueToHtml, onChange, checkForMention, calculateDropdownPosition])

  // 키보드 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // 싱글라인 모드에서 Enter 방지
      if (singleLine && e.key === 'Enter' && !showDropdown) {
        e.preventDefault()
        return
      }

      if (showDropdown) {
        if (e.key === 'Escape') {
          setShowDropdown(false)
          e.preventDefault()
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          insertMention('username')
          e.preventDefault()
        }
      }
    },
    [showDropdown, insertMention, singleLine]
  )

  // 키업 핸들러 - 모든 키 입력 후 동기화
  const handleKeyUp = useCallback(() => {
    syncValue()
  }, [syncValue])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 붙여넣기 시 plain text만 허용
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      const cleanText = singleLine ? text.replace(/[\r\n]/g, '') : text
      document.execCommand('insertText', false, cleanText)
      // 붙여넣기 후 동기화
      setTimeout(syncValue, 0)
    },
    [singleLine, syncValue]
  )

  return (
    <div className="relative">
      <div
        ref={editorRef}
        id={id}
        contentEditable
        role="textbox"
        aria-multiline={!singleLine}
        aria-placeholder={placeholder}
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&_.mention-chip]:inline-flex [&_.mention-chip]:items-center',
          '[&_.mention-chip]:bg-orange-100 [&_.mention-chip]:text-orange-800',
          '[&_.mention-chip]:rounded [&_.mention-chip]:px-1.5 [&_.mention-chip]:py-0.5',
          '[&_.mention-chip]:text-sm [&_.mention-chip]:font-medium [&_.mention-chip]:mx-0.5',
          '[&_.mention-chip]:cursor-default',
          singleLine
            ? 'h-10 py-2 overflow-hidden whitespace-nowrap'
            : 'min-h-[80px] py-2 whitespace-pre-wrap break-words',
          className
        )}
        onInput={syncValue}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        onBlur={syncValue}
        suppressContentEditableWarning
      />

      {/* Placeholder */}
      {!value && (
        <div
          className={cn(
            'pointer-events-none absolute left-3 text-sm text-gray-300',
            singleLine ? 'top-1/2 -translate-y-1/2' : 'top-2'
          )}
        >
          {placeholder}
        </div>
      )}

      {/* Mention Dropdown */}
      {showDropdown && (
        <div
          className="absolute z-50 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          {MENTION_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm bg-white hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault()
                insertMention(option.key)
              }}
            >
              <span className="mr-2 text-orange-500">@</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 단일 라인 입력용 컴포넌트
export function MentionInput(props: Omit<MentionTextareaProps, 'singleLine'>) {
  return <MentionTextarea {...props} singleLine />
}
