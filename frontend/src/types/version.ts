// 版本管理相关的类型定义
export type VersionType = 'major' | 'minor' | 'patch' | 'preview' | 'beta' | 'alpha'

// 严格的版本号格式定义
export type VersionString = `${number}.${number}.${number}` | `${number}.${number}.${number}-${string}`

// 版本信息接口
export interface VersionInfo {
  readonly version: VersionString
  readonly type: VersionType
  readonly buildNumber: number
  readonly releaseDate: string
  readonly changelog: string[]
  readonly isStable: boolean
  readonly requiresMigration: boolean
}

// 版本比较结果
export type VersionComparison = 'newer' | 'older' | 'same' | 'incompatible'

// API版本控制
export interface ApiVersion {
  readonly major: number
  readonly minor: number
  readonly patch: number
  readonly deprecated: boolean
  readonly sunsetDate?: string
}

// 版本兼容性检查
export interface VersionCompatibility {
  readonly minVersion: VersionString
  readonly maxVersion: VersionString
  readonly recommendedVersion: VersionString
  readonly breakingChanges: string[]
}

// 数据迁移版本
export interface MigrationVersion {
  readonly fromVersion: VersionString
  readonly toVersion: VersionString
  readonly migrationScript: string
  readonly rollbackSupported: boolean
}

// 版本验证函数类型
export type VersionValidator = (version: string) => version is VersionString

// 版本比较函数类型
export type VersionComparator = (v1: VersionString, v2: VersionString) => VersionComparison

// 严格的版本号验证
export const isValidVersion: VersionValidator = (version: string): version is VersionString => {
  const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/
  return versionRegex.test(version)
}

// 版本号解析
export const parseVersion = (versionString: VersionString): { major: number; minor: number; patch: number; prerelease?: string } => {
  const [version, prerelease] = versionString.split('-')
  const [major, minor, patch] = version.split('.').map(Number)
  
  return {
    major,
    minor,
    patch,
    prerelease
  }
}

// 版本比较
export const compareVersions: VersionComparator = (v1: VersionString, v2: VersionString): VersionComparison => {
  const parsed1 = parseVersion(v1)
  const parsed2 = parseVersion(v2)
  
  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 'newer' : 'older'
  }
  
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 'newer' : 'older'
  }
  
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 'newer' : 'older'
  }
  
  return 'same'
}

// API请求参数的类型安全定义
export interface VersionedApiRequest<T = any> {
  readonly apiVersion: ApiVersion
  readonly data: T
  readonly timestamp: string
  readonly requestId: string
}

export interface VersionedApiResponse<T = any> {
  readonly apiVersion: ApiVersion
  readonly data: T
  readonly timestamp: string
  readonly requestId: string
  readonly success: boolean
  readonly error?: string
}

// 版本化的数据模型
export interface VersionedData<T = any> {
  readonly version: VersionString
  readonly data: T
  readonly createdAt: string
  readonly updatedAt: string
  readonly checksum: string
}

// 类型安全的版本管理Store
export interface VersionStore {
  readonly currentVersion: VersionString
  readonly availableVersions: VersionInfo[]
  readonly compatibility: VersionCompatibility
  readonly migrations: MigrationVersion[]
  
  checkCompatibility(version: VersionString): boolean
  getMigrationPath(fromVersion: VersionString, toVersion: VersionString): MigrationVersion[]
  validateData<T>(data: VersionedData<T>): boolean
}

