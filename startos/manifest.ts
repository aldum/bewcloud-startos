import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'bewcloud',
  title: 'Bewcloud',
  license: 'mit',
  wrapperRepo: 'https://github.com/Start9Labs/hello-world-wrapper',
  upstreamRepo: 'https://github.com/Start9Labs/hello-world',
  supportSite: 'https://docs.start9.com/',
  marketingSite: 'https://start9.com/',
  donationUrl: 'https://donate.start9.com/',
  description: {
    short: 'Bare bones example of a StartOS service',
    long: 'Bewcloud is a template service that provides examples of basic StartOS features.',
  },
  assets: [],
  volumes: ['main'],
  images: {
    'bewcloud': {
      source: {
        dockerTag: 'ghcr.io/bewcloud/bewcloud:v2.2.2',
      },
    },
    'postgres': {
      source: {
        dockerTag: 'postgres:17',
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
