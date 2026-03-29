import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common' // NestJS 内置
import { Reflector } from '@nestjs/core'                                                        // NestJS 内置：用来读取路由元数据
import { Role } from '@prisma/client'                                                           // Prisma 生成的枚举
import { ROLES_KEY } from '../decorators/roles.decorator'

// Guard（守卫）：在请求到达 Controller 之前执行，决定是否放行
// 类比 Spring Security 的 AccessDecisionManager
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 读取当前路由上 @Roles() 装饰器设置的角色列表
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // 先读方法级别的装饰器
      context.getClass(),   // 再读 Controller 级别的装饰器
    ])

    // 路由没有加 @Roles()，直接放行
    if (!requiredRoles || requiredRoles.length === 0) return true

    // 从 req.user 取当前登录用户（由 JwtStrategy.validate() 挂载）
    const { user } = context.switchToHttp().getRequest()

    // 用户角色不在允许列表里，抛出 403
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('权限不足')
    }

    return true
  }
}
