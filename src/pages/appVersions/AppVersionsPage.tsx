import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AppVersionListResponse,
  Platform,
  UpdateType,
  PLATFORM_LABELS,
  UPDATE_TYPE_LABELS,
  UPDATE_TYPE_COLORS,
  UPDATE_TYPE_DESCRIPTIONS,
} from '@/types/appVersion'
import { appVersionsService } from '@/services/appVersions'
import { useUIStore } from '@/stores/uiStore'
import { VersionForm } from '@/components/VersionForm'
import { VersionChecker } from '@/components/VersionChecker'
import { AppleVersionCard } from '@/components/AppleVersionCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Smartphone,
  Plus,
  MoreVertical,
  Trash2,
  Settings,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Download,
  Search,
  CheckCircle,
  ChevronDown,
  Save,
  RotateCcw,
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function AppVersionsPage() {
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false)
  const [isVersionCheckerOpen, setIsVersionCheckerOpen] = useState(false)
  const [localPolicies, setLocalPolicies] = useState<any>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const {
    data: versionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['app-versions'],
    queryFn: () => appVersionsService.getAllVersions(),
  })

  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
  } = useQuery({
    queryKey: ['app-update-policies'],
    queryFn: () => appVersionsService.getUpdatePolicies(),
  })

  // Initialize localPolicies when policiesData changes
  useEffect(() => {
    if (policiesData) {
      const policies: any = {}
      policiesData.ios?.forEach((policy: any) => {
        policies[policy.id] = policy.updateType
      })
      setLocalPolicies(policies)
      setHasUnsavedChanges(false)
    }
  }, [policiesData])

  const deleteMutation = useMutation({
    mutationFn: appVersionsService.deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] })
      queryClient.invalidateQueries({ queryKey: ['app-update-policies'] })
      addToast({
        type: 'success',
        title: '버전 삭제 완료',
        message: '앱 버전이 성공적으로 삭제되었습니다.',
      })
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '버전 삭제 실패',
        message: '버전을 삭제할 수 없습니다.',
      })
    },
  })

  const updatePolicyMutation = useMutation({
    mutationFn: appVersionsService.updatePolicies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] })
      queryClient.invalidateQueries({ queryKey: ['app-update-policies'] })
      addToast({
        type: 'success',
        title: '정책 업데이트 완료',
        message: '업데이트 정책이 성공적으로 변경되었습니다.',
      })
      setHasUnsavedChanges(false)
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: '정책 업데이트 실패',
        message: error.message || '정책 업데이트 중 오류가 발생했습니다.',
      })
    },
  })

  const handleDeleteVersion = (id: number, version: string) => {
    if (window.confirm(`버전 ${version}을(를) 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleUpdatePolicy = (versionId: number, newUpdateType: UpdateType) => {
    const newPolicies = { ...localPolicies }

    // If setting a version to LATEST, set all other LATEST versions to NONE
    if (newUpdateType === 'LATEST') {
      Object.keys(newPolicies).forEach(id => {
        if (newPolicies[id] === 'LATEST') {
          newPolicies[id] = 'NONE'
        }
      })
    }

    newPolicies[versionId] = newUpdateType
    setLocalPolicies(newPolicies)
    setHasUnsavedChanges(true)
  }

  const handleSavePolicies = () => {
    if (!policiesData) return

    const updatedPolicies = policiesData.ios.map((policy: any) => ({
      id: policy.id,
      updateType: localPolicies[policy.id] || policy.updateType
    }))

    updatePolicyMutation.mutate({
      ios: updatedPolicies,
      android: []
    })
  }

  const handleResetPolicies = () => {
    if (!policiesData) return

    const policies: any = {}
    policiesData.ios?.forEach((policy: any) => {
      policies[policy.id] = policy.updateType
    })
    setLocalPolicies(policies)
    setHasUnsavedChanges(false)
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

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '-'
    try {
      const date = new Date(dateTimeString)
      if (isNaN(date.getTime())) return dateTimeString
      return format(date, 'yyyy-MM-dd HH:mm', { locale: ko })
    } catch (error) {
      return dateTimeString
    }
  }

  const getVersionsByPlatform = (platform: Platform) => {
    if (!versionsData) return []
    const versions = platform === 'IOS' ? versionsData.ios : versionsData.android
    // 출시일 내림차순 정렬 (최신 출시일이 위로)
    return versions.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  }

  const getLatestVersion = (platform: Platform) => {
    const versions = getVersionsByPlatform(platform)
    return versions.find(v => v.updateType === 'LATEST')?.version || '-'
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">앱 버전 관리</h1>
          <p className="text-muted-foreground mt-1">
            앱 버전 및 업데이트 정책을 관리하세요
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">앱 버전 관리</h1>
          <p className="text-muted-foreground mt-1">
            iOS 앱 버전과 업데이트 정책을 관리하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsVersionCheckerOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            버전 체크
          </Button>
          <Button
            onClick={() => setIsVersionFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 버전 등록
          </Button>
        </div>
      </div>

      {/* iOS 버전 요약 */}
      <AppleVersionCard
        latestVersion={getLatestVersion('IOS')}
        totalVersions={getVersionsByPlatform('IOS').length}
      />

      {/* iOS 버전 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                iOS 앱 버전 목록
              </CardTitle>
              <CardDescription className="mt-1">
                iOS 앱의 버전과 업데이트 정책을 확인하고 관리하세요.
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    저장되지 않은 변경사항
                  </span>
                )}
              </CardDescription>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetPolicies}
                  variant="outline"
                  size="sm"
                  disabled={updatePolicyMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  초기화
                </Button>
                <Button
                  onClick={handleSavePolicies}
                  size="sm"
                  disabled={updatePolicyMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {updatePolicyMutation.isPending ? '저장 중...' : '정책 저장'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <VersionTable
            versions={getVersionsByPlatform('IOS')}
            platform="IOS"
            isLoading={isLoading}
            onDeleteVersion={handleDeleteVersion}
            onUpdatePolicy={handleUpdatePolicy}
            policiesData={policiesData}
            localPolicies={localPolicies}
          />
        </CardContent>
      </Card>

      {/* 버전 등록 모달 */}
      <VersionForm
        isOpen={isVersionFormOpen}
        onClose={() => setIsVersionFormOpen(false)}
      />

      {/* 버전 체크 모달 */}
      <VersionChecker
        isOpen={isVersionCheckerOpen}
        onClose={() => setIsVersionCheckerOpen(false)}
      />
    </div>
  )
}

interface VersionTableProps {
  versions: any[]
  platform: Platform
  isLoading: boolean
  onDeleteVersion: (id: number, version: string) => void
  onUpdatePolicy: (versionId: number, updateType: UpdateType) => void
  policiesData: any
  localPolicies: any
}

function VersionTable({ versions, platform, isLoading, onDeleteVersion, onUpdatePolicy, policiesData, localPolicies }: VersionTableProps) {
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

  const getCurrentPolicy = (versionId: number) => {
    // Use localPolicies if available, otherwise fallback to original data
    if (localPolicies && localPolicies[versionId]) {
      return localPolicies[versionId]
    }
    if (!policiesData) return 'NONE'
    const policies = platform === 'IOS' ? policiesData.ios : policiesData.android
    const policy = policies.find((p: any) => p.id === versionId)
    return policy?.updateType || 'NONE'
  }

  const hasLatestVersion = () => {
    // Check in localPolicies first
    if (localPolicies) {
      return Object.values(localPolicies).includes('LATEST')
    }
    if (!policiesData) return false
    const policies = platform === 'IOS' ? policiesData.ios : policiesData.android
    return policies.some((p: any) => p.updateType === 'LATEST')
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '-'
    try {
      const date = new Date(dateTimeString)
      if (isNaN(date.getTime())) return dateTimeString
      return format(date, 'yyyy-MM-dd HH:mm', { locale: ko })
    } catch (error) {
      return dateTimeString
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[80px] font-semibold text-gray-900 text-center">버전</TableHead>
              <TableHead className="w-[100px] font-semibold text-gray-900 text-center">출시일</TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-900 text-center pr-12">등록일</TableHead>
              <TableHead className="w-[200px] font-semibold text-gray-900 pl-4">업데이트 정책</TableHead>
              <TableHead className="w-[60px] font-semibold text-gray-900 text-center">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-gray-50/50">
                <TableCell className="py-4 text-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableCell>
                <TableCell className="py-4 text-center pr-12">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableCell>
                <TableCell className="py-4 pl-4">
                  <div className="h-9 w-44 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-[80px] font-semibold text-gray-900 text-center">버전</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-900 text-center">출시일</TableHead>
            <TableHead className="w-[120px] font-semibold text-gray-900 text-center pr-12">등록일</TableHead>
            <TableHead className="w-[200px] font-semibold text-gray-900 pl-4">업데이트 정책</TableHead>
            <TableHead className="w-[60px] font-semibold text-gray-900 text-center">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                등록된 iOS 버전이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            versions.map((version) => {
              const currentPolicy = getCurrentPolicy(version.id)
              const isLatest = hasLatestVersion()
              const canSetLatest = currentPolicy === 'LATEST' || !isLatest

              return (
                <TableRow key={version.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-mono font-medium text-gray-900 py-4 text-center">
                    {version.version}
                  </TableCell>
                  <TableCell className="text-sm py-4 text-center">
                    <span className="text-gray-700">{formatDate(version.releaseDate)}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 py-4 text-center pr-12">
                    {formatDateTime(version.createdAt)}
                  </TableCell>
                  <TableCell className="py-4 pl-4">
                    <Select
                      value={currentPolicy}
                      onValueChange={(value) => onUpdatePolicy(version.id, value as UpdateType)}
                    >
                      <SelectTrigger className="w-44">
                        <div className="flex items-center justify-start">
                          <Badge className={`${UPDATE_TYPE_COLORS[currentPolicy as UpdateType]} border`}>
                            {UPDATE_TYPE_LABELS[currentPolicy as UpdateType]}
                          </Badge>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">
                          <Badge className={`${UPDATE_TYPE_COLORS.NONE} border`}>
                            {UPDATE_TYPE_LABELS.NONE}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="RECOMMENDED">
                          <Badge className={`${UPDATE_TYPE_COLORS.RECOMMENDED} border`}>
                            {UPDATE_TYPE_LABELS.RECOMMENDED}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="FORCE">
                          <Badge className={`${UPDATE_TYPE_COLORS.FORCE} border`}>
                            {UPDATE_TYPE_LABELS.FORCE}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="LATEST" disabled={!canSetLatest}>
                          <Badge className={`${UPDATE_TYPE_COLORS.LATEST} border ${!canSetLatest ? 'opacity-50' : ''}`}>
                            {UPDATE_TYPE_LABELS.LATEST}
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {version.canDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onDeleteVersion(version.id, version.version)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

