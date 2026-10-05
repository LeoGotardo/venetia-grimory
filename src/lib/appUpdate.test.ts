import { describe, expect, it } from 'vitest'
import { pickUpdate, versionCodeFromTag } from './appUpdate'

const apk = { name: 'grimorio-de-venetia-v1.2.0.apk', browser_download_url: 'https://github.com/x/y.apk' }

describe('versionCodeFromTag', () => {
  it('segue a fórmula do build-android-release.sh', () => {
    expect(versionCodeFromTag('v1.2.3')).toBe(10203)
    expect(versionCodeFromTag('v1.0.0')).toBe(10000)
    expect(versionCodeFromTag('v2.10.0')).toBe(21000)
  })

  it('recusa tags fora do padrão', () => {
    expect(versionCodeFromTag('1.2.3')).toBeNull()
    expect(versionCodeFromTag('v1.2')).toBeNull()
    expect(versionCodeFromTag('v1.2.3-beta')).toBeNull()
    expect(versionCodeFromTag('v1.100.0')).toBeNull()
  })
})

describe('pickUpdate', () => {
  it('oferece a release quando o versionCode é maior', () => {
    expect(pickUpdate({ tag_name: 'v1.2.0', assets: [apk] }, 10100)).toEqual({
      version: 'v1.2.0',
      apkUrl: apk.browser_download_url,
      apkName: apk.name,
    })
  })

  it('não oferece a mesma versão nem uma menor', () => {
    expect(pickUpdate({ tag_name: 'v1.2.0', assets: [apk] }, 10200)).toBeNull()
    expect(pickUpdate({ tag_name: 'v1.2.0', assets: [apk] }, 10300)).toBeNull()
  })

  it('ignora rascunho, pré-release e release sem APK', () => {
    expect(pickUpdate({ tag_name: 'v1.2.0', draft: true, assets: [apk] }, 1)).toBeNull()
    expect(pickUpdate({ tag_name: 'v1.2.0', prerelease: true, assets: [apk] }, 1)).toBeNull()
    expect(pickUpdate({ tag_name: 'v1.2.0', assets: [{ name: 'notes.txt', browser_download_url: 'https://x' }] }, 1)).toBeNull()
  })
})
