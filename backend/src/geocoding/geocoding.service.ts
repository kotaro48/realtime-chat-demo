/**
 * [INPUT]: 依赖 Node.js 内置 fetch，依赖环境变量 GOOGLE_MAPS_API_KEY
 * [OUTPUT]: 对外提供 GeocodingService.search(q) 方法，返回 [{lat,lng,displayName}]
 * [POS]: geocoding 模块的核心，代理 Google Places API (New) Text Search，处理缓存
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Injectable, Logger } from '@nestjs/common'  // NestJS 内置：Injectable/Logger

export interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
}

// Google Places API (New) Text Search 响应格式
interface PlacesResponse {
  places?: PlaceItem[]
}

interface PlaceItem {
  formattedAddress?: string
  displayName?: { text: string; languageCode?: string }
  location?: { latitude: number; longitude: number }
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name)

  // 简单内存缓存：key=查询词，value={结果, 过期时间}
  private readonly cache = new Map<string, { results: GeocodingResult[]; expiresAt: number }>()
  private readonly CACHE_TTL_MS = 10 * 60 * 1000  // 10 分钟

  async search(q: string): Promise<GeocodingResult[]> {
    if (!q || q.trim().length < 2) return []

    const key = q.trim().toLowerCase()

    // 命中缓存
    const cached = this.cache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.results
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      this.logger.error('GOOGLE_MAPS_API_KEY is not set')
      return []
    }

    try {
      // Places API (New) Text Search —— 支持模糊搜索店铺/地标/POI
      // languageCode=ja: 返回日文；regionCode=JP: 偏向日本结果
      // X-Goog-FieldMask: 必须指定需要的字段，不指定会返回 400
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
        },
        body: JSON.stringify({
          textQuery: q,
          languageCode: 'ja',
          regionCode: 'JP',
          maxResultCount: 5,
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        this.logger.warn(`Places API returned ${res.status} for query "${q}": ${text}`)
        return []
      }

      const data: PlacesResponse = await res.json()
      const places = data.places ?? []

      const results: GeocodingResult[] = places
        .filter(p => p.location && (p.displayName?.text || p.formattedAddress))
        .map(p => {
          // 拼接：显示名 + 格式化地址，如 "AKB48劇場, 〒101-0021 東京都千代田区..."
          // 与地址相同则只显示一次
          const name = p.displayName?.text ?? ''
          const addr = p.formattedAddress ?? ''
          const displayName = name && addr && name !== addr ? `${name}, ${addr}` : name || addr
          return {
            lat: p.location!.latitude,
            lng: p.location!.longitude,
            displayName,
          }
        })

      // 写入缓存
      this.cache.set(key, { results, expiresAt: Date.now() + this.CACHE_TTL_MS })

      return results
    } catch (err) {
      this.logger.error(`Places search failed for query "${q}": ${err}`)
      return []
    }
  }
}
