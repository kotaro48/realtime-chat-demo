import { SetMetadata } from '@nestjs/common' // NestJS 内置：把自定义数据附加到路由的元数据上，供 Guard 读取
import { Role } from '@prisma/client'         // Prisma 生成的枚举：USER / MODERATOR / ADMIN

// ROLES_KEY 是元数据的 key，RolesGuard 用这个 key 来读取允许的角色列表
export const ROLES_KEY = 'roles'

// @Roles('ADMIN') 装饰器：标记某个路由只允许指定角色访问
// 类比 Spring Security 的 @PreAuthorize("hasRole('ADMIN')")
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
