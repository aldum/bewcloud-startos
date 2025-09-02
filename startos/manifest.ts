import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const architectures =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

export const manifest = setupManifest({
  id: 'bewcloud',
  title: 'Bewcloud',
  license: 'MIT',
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
    bewcloud: {
      source: {
        dockerTag: 'ghcr.io/bewcloud/bewcloud:v2.4.7',
      },
      arch: ['x86_64'], // no upstream aarch64 support for now
    } as SDKImageInputSpec,
    db: {
      source: {
        dockerTag: 'postgres:17-alpine',
      },
      arch: ['x86_64'], // no upstream aarch64 support for now
    } as SDKImageInputSpec,
  },
  // hardwareRequirements: { arch: architectures },
  hardwareRequirements: {
    arch: ['x86_64'],
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
