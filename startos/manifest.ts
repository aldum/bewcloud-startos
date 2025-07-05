import { setupManifest } from '@start9labs/start-sdk'

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
  assets: [],
  volumes: ['main'],
  images: {
    'bewcloud': {
      source: {
        dockerTag: 'ghcr.io/bewcloud/bewcloud:v2.3.1@sha256:013f57bb5301af7d3f4d573125d0cdcb15094c183fa08ff944bed251bda36814',
      },
    },
    'postgres': {
      source: {
        dockerTag: 'postgres:17-alpine',
      },
    },
  },
  hardwareRequirements: {},
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
