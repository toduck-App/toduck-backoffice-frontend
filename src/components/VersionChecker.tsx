import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import {
  VersionCheckRequest,
  Platform,
  PLATFORM_LABELS,
  VERSION_CHECK_STATUS_LABELS,
} from '@/types/appVersion'
import { appVersionsService } from '@/services/appVersions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react'

const versionCheckSchema = z.object({
  platform: z.enum(['ios', 'android'], {
    required_error: '플랫폼을 선택해주세요.',
  }),
  version: z
    .string()
    .min(1, '버전을 입력해주세요.')
    .regex(/^\d+\.\d+\.\d+$/, '버전은 x.y.z 형식이어야 합니다. (예: 1.2.3)'),
})

type VersionCheckFormData = z.infer<typeof versionCheckSchema>

interface VersionCheckerProps {
  isOpen: boolean
  onClose: () => void
}

export function VersionChecker({ isOpen, onClose }: VersionCheckerProps) {
  const [checkResult, setCheckResult] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<VersionCheckFormData>({
    resolver: zodResolver(versionCheckSchema),
    mode: 'onChange',
  })

  const platform = watch('platform')

  const checkMutation = useMutation({
    mutationFn: appVersionsService.checkVersion,
    onSuccess: (data) => {
      setCheckResult(data)
    },
    onError: (error: any) => {
      setCheckResult({
        error: error.message || '버전 체크 중 오류가 발생했습니다.',
      })
    },
  })

  const onSubmit = (data: VersionCheckFormData) => {
    setCheckResult(null)
    checkMutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    setCheckResult(null)
    onClose()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NONE':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'RECOMMENDED':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'FORCE':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NONE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'RECOMMENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FORCE':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            앱 버전 체크
          </DialogTitle>
          <DialogDescription>
            특정 버전에 대한 업데이트 정책을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">플랫폼</Label>
            <Select
              value={platform}
              onValueChange={(value) => setValue('platform', value as any, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="플랫폼을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ios">iOS</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-sm text-red-600">{errors.platform.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">체크할 버전</Label>
            <Input
              id="version"
              placeholder="예: 1.2.3"
              {...register('version')}
            />
            {errors.version && (
              <p className="text-sm text-red-600">{errors.version.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || checkMutation.isPending}
            className="w-full"
          >
            {checkMutation.isPending ? '체크 중...' : '버전 체크'}
          </Button>
        </form>

        {checkResult && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              {checkResult.error ? (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span>{checkResult.error}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checkResult.updateStatus)}
                    <Badge className={`${getStatusColor(checkResult.updateStatus)} border`}>
                      {VERSION_CHECK_STATUS_LABELS[checkResult.updateStatus]}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium">최신 버전:</span> {checkResult.latestVersion}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}