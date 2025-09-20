import { SessionTimer } from './SessionTimer'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">관리자 대시보드</h1>
      </div>
      <div className="flex items-center">
        <SessionTimer />
      </div>
    </header>
  )
}