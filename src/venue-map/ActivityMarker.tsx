/**
 * [INPUT]: 依赖 @vis.gl/react-google-maps 的 AdvancedMarker，依赖 ActivityLog 类型
 * [OUTPUT]: 对外提供 ActivityMarker 组件（用户头像图钉 + hover 悬停卡）
 * [POS]: venue-map 模块的地图 marker 渲染，被 ActivityMapPage 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { AdvancedMarker } from '@vis.gl/react-google-maps'  // @vis.gl/react-google-maps: Google 官方 React 封装
import { Calendar, Users } from 'lucide-react'  // lucide-react: 图标
import type { ActivityLog } from '../types'

// 活动类型中文/日文标签
const EVENT_TYPE_LABELS: Record<string, string> = {
  HANDSHAKE:  '握手会',
  CONCERT:    'コンサート',
  THEATER:    '劇場公演',
  PILGRIMAGE: '聖地巡礼',
  OTHER:      'その他',
}

interface ActivityMarkerProps {
  log: ActivityLog
  onClick: (log: ActivityLog) => void
  /** 当前用户头像 URL（头像作为图钉主体）*/
  userAvatarUrl?: string | null
  /** 当前用户 avatarColor，无头像时的 fallback 背景色 */
  userAvatarColor: string
  /** 当前用户昵称，无头像时取首字符显示 */
  userNickname: string
}

export function ActivityMarker({
  log,
  onClick,
  userAvatarUrl,
  userAvatarColor,
  userNickname,
}: ActivityMarkerProps) {
  const dateStr = new Date(log.date).toLocaleDateString('ja-JP', {
    month: 'numeric', day: 'numeric',
  })

  // 头像占位字符：昵称首字，或 "?"
  const fallbackChar = userNickname.trim().charAt(0).toUpperCase() || '?'

  return (
    <AdvancedMarker
      position={{ lat: log.lat, lng: log.lng }}
      onClick={() => onClick(log)}
      title={log.venueName}
    >
      {/* 外层 group: 用于触发 hover 卡显示（纯 CSS，无需 state）
          translateY(-50%) 让图钉尖端对准真实坐标点 */}
      <div className="group relative cursor-pointer" style={{ transform: 'translateY(-50%)' }}>
        {/* 图钉主体：圆形头像 + 白边 + 阴影 */}
        <div
          className="relative w-9 h-9 rounded-full border-[2.5px] border-white shadow-md overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: userAvatarColor }}
        >
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt={userNickname}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"   /* Google 头像某些情况需要 */
              draggable={false}
            />
          ) : (
            <span className="text-white font-ui font-semibold text-[14px]">
              {fallbackChar}
            </span>
          )}
        </div>

        {/* 图钉小三角：尖端指向坐标 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0 pointer-events-none"
          style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid white',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
          }}
        />

        {/* Hover 悬停卡（桌面端）：绝对定位在头像上方 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none
                     opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-150 z-10"
        >
          <div className="bg-bg/95 backdrop-blur-sm border border-ds-border rounded-xl shadow-xl px-3 py-2.5 w-[220px]">
            {/* 场馆名 */}
            <div className="font-jp text-[13px] font-semibold text-ds-text truncate">
              {log.venueName}
            </div>

            {/* 日期 + 类型徽章 */}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-ds-text-3 font-ui">
              <Calendar size={11} />
              <span>{dateStr}</span>
              <span className="mx-1 text-ds-border">|</span>
              <span className="text-ds-accent">{EVENT_TYPE_LABELS[log.eventType] ?? log.eventType}</span>
            </div>

            {/* 成员叠加头像：水平错位 */}
            {log.members.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Users size={11} className="text-ds-text-3 shrink-0" />
                <div className="flex -space-x-2">
                  {log.members.slice(0, 5).map(lm => (
                    <div
                      key={lm.memberId}
                      className="w-5 h-5 rounded-full border-[1.5px] border-bg overflow-hidden bg-ds-border flex items-center justify-center"
                      title={lm.member.name}
                    >
                      {lm.member.imageUrl ? (
                        <img
                          src={lm.member.imageUrl}
                          alt={lm.member.name}
                          className="w-full h-full object-cover"
                          /* AKB 官网头像是半身照，脸在上半部分，把锚点上移避免切到下巴 */
                          style={{ objectPosition: 'center 18%' }}
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                      ) : (
                        <span className="text-[8px] font-ui text-ds-text-3">
                          {lm.member.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {log.members.length > 5 && (
                  <span className="text-[10px] text-ds-text-3 font-ui ml-1">
                    +{log.members.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* 卡片下方小三角，指向头像 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--ds-bg, #fff)',
              }}
            />
          </div>
        </div>
      </div>
    </AdvancedMarker>
  )
}
