import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppVersionCreateRequest, Platform, PLATFORM_LABELS } from '@/types/appVersion'
import { appVersionsService } from '@/services/appVersions'
import { useUIStore } from '@/stores/uiStore'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Plus } from 'lucide-react'

const versionSchema = z.object({
  platform: z.enum(['IOS', 'ANDROID'], {
    required_error: '플랫폼을 선택해주세요.',
  }),
  version: z
    .string()
    .min(1, '버전을 입력해주세요.')
    .regex(/^\d+\.\d+\.\d+$/, '버전은 x.y.z 형식이어야 합니다. (예: 1.2.3)'),
  releaseDate: z
    .date({
      required_error: '출시일을 선택해주세요.',
      invalid_type_error: '올바른 날짜를 선택해주세요.',
    })
    .refine(
      (date) => date <= new Date(),
      {
        message: '미래 날짜는 선택할 수 없습니다.',
      }
    ),
})

type VersionFormData = z.infer<typeof versionSchema>

interface VersionFormProps {
  isOpen: boolean
  onClose: () => void
}

export function VersionForm({ isOpen, onClose }: VersionFormProps) {
  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<VersionFormData>({
    resolver: zodResolver(versionSchema),
    mode: 'onChange',
  })

  const platform = watch('platform')

  const createMutation = useMutation({
    mutationFn: appVersionsService.createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] })
      queryClient.invalidateQueries({ queryKey: ['app-update-policies'] })
      addToast({
        type: 'success',
        title: '버전 등록 완료',
        message: '새 앱 버전이 성공적으로 등록되었습니다.',
      })
      handleClose()
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '버전 등록 실패',
        message: error.message || '버전 등록 중 오류가 발생했습니다.',
      })
      handleClose()
    },
  })

  const onSubmit = (data: VersionFormData) => {
    const submitData: AppVersionCreateRequest = {
      ...data,
      releaseDate: data.releaseDate.toISOString().split('T')[0],
    }
    createMutation.mutate(submitData)
  }

  const handleClose = () => {
    reset()
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            새 앱 버전 등록
          </DialogTitle>
          <DialogDescription>
            새로운 앱 버전을 등록합니다. 등록 후 업데이트 정책을 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">플랫폼</Label>
            <Select
              value={platform}
              onValueChange={(value) => setValue('platform', value as Platform, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="플랫폼을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IOS">{PLATFORM_LABELS.IOS}</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-sm text-red-600">{errors.platform.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">버전</Label>
            <Input
              id="version"
              placeholder="예: 1.2.3"
              {...register('version')}
            />
            {errors.version && (
              <p className="text-sm text-red-600">{errors.version.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDate">출시일</Label>
            <Controller
              name="releaseDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                  placeholder="출시일을 선택하세요"
                  disabled={createMutation.isPending}
                  disabledDays={(date) => {
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    return date > today
                  }}
                />
              )}
            />
            {errors.releaseDate && (
              <p className="text-sm text-red-600">{errors.releaseDate.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createMutation.isPending}
            >
              {createMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}