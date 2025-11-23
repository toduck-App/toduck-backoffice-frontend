import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Bell,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: '대시보드',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: '사용자 관리',
    href: '/users',
    icon: Users,
  },
  {
    name: '게시글 관리',
    href: '/socials',
    icon: FileText,
  },
  {
    name: '알림 관리',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: '앱 버전 관리',
    href: '/app-versions',
    icon: Smartphone,
  },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore()
  const { user, logout } = useAuthStore()

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
      }
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarCollapsed])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col bg-white border-r border-gray-200 transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-200",
        sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            {/* 펼쳐진 상태 로고 자리 - 가로가 긴 이미지용 */}
            <div className="h-8 flex items-center justify-center">
              <img src="/images/logo-horizontal.png" alt="토덕 백오피스" className="h-6" />
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={toggleSidebar}
            title="사이드바 펼치기"
          >
            {/* 접힌 상태 로고 자리 - 1:1 정사각형 이미지용 */}
            <img src="/images/logo-square.png" alt="토덕" className="h-6 w-6" />
          </div>
        )}
        {!sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1",
        sidebarCollapsed ? "p-2 pt-4" : "p-4"
      )}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-lg text-sm font-medium transition-colors',
                sidebarCollapsed
                  ? 'justify-center p-2 mx-1'
                  : 'px-3 py-2.5',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  !sidebarCollapsed && 'mr-3',
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'
                )}
              />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Footer */}
      <div className="border-t border-gray-200 p-4">
        {!sidebarCollapsed ? (
          <div>
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.nickname || '사용자'}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<img src="/images/default-profile.png" alt="기본 프로필" class="h-8 w-8 rounded-full object-cover" />';
                    }}
                  />
                ) : (
                  <img src="/images/default-profile.png" alt="기본 프로필" className="h-8 w-8 rounded-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nickname || '관리자'}
                </p>
                <p className="text-xs text-gray-500 truncate">시스템 관리자</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.nickname || '사용자'}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<img src="/images/default-profile.png" alt="기본 프로필" class="h-8 w-8 rounded-full object-cover" />';
                  }}
                />
              ) : (
                <img src="/images/default-profile.png" alt="기본 프로필" className="h-8 w-8 rounded-full object-cover" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}