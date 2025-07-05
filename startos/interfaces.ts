import { sdk } from './sdk'
import { davPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const davMulti = sdk.MultiHost.of(effects, 'dav-multi')
  const davMultiOrigin = await davMulti.bindPort(
    davPort, { protocol: 'http' }
  )
  const dav = sdk.createInterface(effects, {
    name: 'WebDAV',
    id: 'dav',
    description: 'CalDAV/CardDAV api',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const uiMulti = sdk.MultiHost.of(effects, 'dac-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: 'Web UI',
    id: 'ui',
    description: 'The web interface of BewCloud',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const davReceipt = await davMultiOrigin.export([dav])
  const uiReceipt = await uiMultiOrigin.export([ui])

  return [davReceipt, uiReceipt]
})
