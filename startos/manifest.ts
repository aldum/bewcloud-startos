import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const architectures = (() => {
  if (BUILD === 'x86_64' || BUILD === 'x86' || BUILD === 'x64') {
    return ['x86_64']
  } else if (BUILD === 'aarch64' || BUILD === 'arm' || BUILD === 'arm64') {
    return ['aarch64']
  } else {
    return ['x86_64', 'aarch64']
  }
})()


export const manifest = setupManifest({
  id: 'bewcloud',
  title: 'Bewcloud',
  license: 'mit',
  wrapperRepo: 'https://github.com/aldum/bewcloud-startos',
  upstreamRepo: 'https://github.com/bewcloud/bewcloud',
  supportSite: 'https://github.com/bewcloud/bewcloud/issues',
  marketingSite: 'https://bewcloud.com/',
  donationUrl: 'https://github.com/sponsors/bewcloud',
  docsUrl: 'https://donate.start9.com/',
  description: {
    short: 'Bewcloud',
    long: 'Bewcloud is service',
  },
  volumes: ['main', 'config'],
  images: {
    'bewcloud': {
      source: {
        dockerTag: 'ghcr.io/bewcloud/bewcloud:v2.4.7',
      },
      arch: architectures,
    } as SDKImageInputSpec,
    'db': {
      source: {
        dockerTag: 'postgres:17-alpine',
      },
      arch: architectures,
    } as SDKImageInputSpec,
  },
  hardwareRequirements: {
    arch: architectures,
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
