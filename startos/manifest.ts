import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const architectures =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

const isProd = process.env.ENV === 'PROD'
const bewImage = isProd ? {
  dockerBuild: {
    dockerfile: './Dockerfile',
    workdir: 'bewcloud'
  }
} : {
  dockerTag: 'ghcr.io/bewcloud/bewcloud:v2.5.0@sha256:aa771cdd1ab747febcb95698bb4add1150843c5eecb1e451b57b69271fa6635f'
}

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
      arch: architectures,
      source: bewImage,
    } as SDKImageInputSpec,
    db: {
      source: {
        dockerTag: 'postgres:17-alpine',
      },
      arch: architectures,
    } as SDKImageInputSpec,
    dav: {
      source: {
        dockerTag: 'tomsquest/docker-radicale:3.5.5.0',
      },
      arch: architectures,
    } as SDKImageInputSpec,
  },
  hardwareRequirements: { arch: architectures },
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
