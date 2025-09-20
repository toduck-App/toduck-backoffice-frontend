import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  UpdatePolicyRequest,
  UpdatePolicyItemRequest,
  UpdateType,
  Platform,
  PLATFORM_LABELS,
  UPDATE_TYPE_LABELS,
  UPDATE_TYPE_DESCRIPTIONS,
  UPDATE_TYPE_COLORS,
} from '@/types/appVersion'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface UpdatePolicyManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function UpdatePolicyManager({ isOpen, onClose }: UpdatePolicyManagerProps) {
  const [iosPolicies, setIosPolicies] = useState<UpdatePolicyItemRequest[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const {
    data: policiesData,
    isLoading,
  } = useQuery({
    queryKey: ['app-update-policies'],
    queryFn: () => appVersionsService.getUpdatePolicies(),
    enabled: isOpen,
  })

  const updateMutation = useMutation({
    mutationFn: appVersionsService.updatePolicies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-update-policies'] })
      queryClient.invalidateQueries({ queryKey: ['app-versions'] })
      addToast({
        type: 'success',
        title: '정책 업데이트 완료',
        message: '업데이트 정책이 성공적으로 변경되었습니다.',
      })
      setHasChanges(false)
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '정책 업데이트 실패',
        message: error.message || '정책 업데이트 중 오류가 발생했습니다.',
      })
    },
  })

  useEffect(() => {
    if (policiesData) {
      setIosPolicies(
        policiesData.ios.map(p => ({
          id: p.id,
          updateType: p.updateType,
        }))
      )
      setHasChanges(false)
    }
  }, [policiesData])

  const handlePolicyChange = (platform: Platform, id: number, updateType: UpdateType) => {
    setIosPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, updateType } : p))
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    const request: UpdatePolicyRequest = {
      ios: iosPolicies,
      android: [],
    }
    updateMutation.mutate(request)
  }

  const handleReset = () => {
    if (policiesData) {
      setIosPolicies(
        policiesData.ios.map(p => ({
          id: p.id,
          updateType: p.updateType,
        }))
      )
      setHasChanges(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return format(date, 'yyyy-MM-dd', { locale: ko })
    } catch (error) {
      return dateString
    }
  }

  const getVersionData = (platform: Platform) => {
    if (!policiesData) return []
    return platform === 'IOS' ? policiesData.ios : policiesData.android
  }

  const getCurrentPolicies = (platform: Platform) => {
    return iosPolicies
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            업데이트 정책 관리
          </DialogTitle>
          <DialogDescription>
            각 버전별로 업데이트 정책을 설정하세요. 한 플랫폼당 하나의 버전만 "최신 버전"으로 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">정책 정보를 불러오는 중...</p>
          </div>
        ) : (
          <div className="py-4">
            <PolicyTable
              platform="IOS"
              versions={getVersionData('IOS')}
              policies={getCurrentPolicies('IOS')}
              onPolicyChange={handlePolicyChange}
            />

            {hasChanges && (
              <Card className="mt-6 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm">저장되지 않은 변경사항이 있습니다.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || updateMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            닫기
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PolicyTableProps {
  platform: Platform
  versions: any[]
  policies: UpdatePolicyItemRequest[]
  onPolicyChange: (platform: Platform, id: number, updateType: UpdateType) => void
}

function PolicyTable({ platform, versions, policies, onPolicyChange }: PolicyTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return format(date, 'yyyy-MM-dd', { locale: ko })
    } catch (error) {
      return dateString
    }
  }

  const getCurrentPolicy = (id: number) => {
    return policies.find(p => p.id === id)?.updateType || 'NONE'
  }

  // Check if there's already a LATEST version
  const hasLatestVersion = policies.some(p => p.updateType === 'LATEST')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{PLATFORM_LABELS[platform]} 정책 설정</h3>

      {versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          등록된 {PLATFORM_LABELS[platform]} 버전이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => {
            const currentPolicy = getCurrentPolicy(version.id)
            const canSetLatest = currentPolicy === 'LATEST' || !hasLatestVersion

            return (
              <Card key={version.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-mono font-medium text-lg">{version.version}</div>
                      <div className="text-sm text-gray-600">
                        출시일: {formatDate(version.releaseDate)}
                      </div>
                    </div>
                    <Badge className={`${UPDATE_TYPE_COLORS[currentPolicy as UpdateType]} border`}>
                      {UPDATE_TYPE_LABELS[currentPolicy as UpdateType]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={currentPolicy}
                      onValueChange={(value) => onPolicyChange(platform, version.id, value as UpdateType)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">
                          <div className="flex flex-col items-start">
                            <span>{UPDATE_TYPE_LABELS.NONE}</span>
                            <span className="text-xs text-gray-500">
                              {UPDATE_TYPE_DESCRIPTIONS.NONE}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="FORCE">
                          <div className="flex flex-col items-start">
                            <span>{UPDATE_TYPE_LABELS.FORCE}</span>
                            <span className="text-xs text-gray-500">
                              {UPDATE_TYPE_DESCRIPTIONS.FORCE}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="RECOMMENDED">
                          <div className="flex flex-col items-start">
                            <span>{UPDATE_TYPE_LABELS.RECOMMENDED}</span>
                            <span className="text-xs text-gray-500">
                              {UPDATE_TYPE_DESCRIPTIONS.RECOMMENDED}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="LATEST" disabled={!canSetLatest}>
                          <div className="flex flex-col items-start">
                            <span>{UPDATE_TYPE_LABELS.LATEST}</span>
                            <span className="text-xs text-gray-500">
                              {UPDATE_TYPE_DESCRIPTIONS.LATEST}
                            </span>
                            {!canSetLatest && (
                              <span className="text-xs text-red-500">
                                이미 최신 버전이 설정되어 있습니다
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}