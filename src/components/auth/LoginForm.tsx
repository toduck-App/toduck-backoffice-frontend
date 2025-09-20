import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  loginId: z
    .string()
    .min(5, '아이디는 최소 5자 이상이어야 합니다')
    .max(20, '아이디는 최대 20자까지 가능합니다')
    .regex(/^[a-z0-9_-]+$/, '아이디는 소문자, 숫자, _, - 만 사용 가능합니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'
    ),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      // Navigation will be handled by the router
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <Card className="border-0">
      <CardHeader className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg flex items-center justify-center">
            <img src="/images/logo-square.png" alt="토덕" className="h-10 w-10" />
          </div>
        </div>
        <div>
          <CardTitle className="text-xl">토덕 백오피스</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            관리자 계정으로 로그인하세요
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginId" className="text-sm">아이디</Label>
            <Input
              id="loginId"
              placeholder="아이디를 입력하세요"
              {...register('loginId')}
              disabled={isLoading}
            />
            {errors.loginId && (
              <p className="text-sm text-semantic-error">{errors.loginId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                {...register('password')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-semantic-error">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-semantic-error/10 border border-semantic-error/20">
              <p className="text-sm text-semantic-error">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>로그인</span>
              </div>
            )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}