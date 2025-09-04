import { sdk } from './sdk'
import { Effects } from
  '@start9labs/start-sdk/base/lib/Effects'
import { configFile } from './fileModels/config'
import { unsafeReadStore } from './fileModels/store.json'
import * as dbSub from './subcontainers/db'
import * as mainSub from './subcontainers/bewcloud'
import { psqlPort, uiPort, psqlDaemonUser } from './utils'
import { exec } from 'node:child_process'

export const main = sdk.setupMain(async ({
  effects,
  started
}: {
  effects: Effects,
  started: any
}) => {
  console.info('### Starting Bewcloud! ###')

  const store = await unsafeReadStore()

  const dbEnv = await dbSub.getEnv(store)
  const db = await dbSub.getSubcontainer(effects)

  const mainEnv = await mainSub.getEnv(store)
  const mainC = await mainSub.getSubcontainer(effects)
  exec('chown -R 1993:1993 /media/startos/volumes/main/bewcloud')

  configFile.write(effects, {
    auth: {
      baseUrl: 'http://localhost:8000',
      allowSignups: false,
      enableEmailVerification: false,
      enableForeverSignup: true,
      enableMultiFactor: false,
      skipCookieDomainSecurity: true,
    }
  })

  return sdk.Daemons.of(effects, started)
    .addDaemon('db', {
      subcontainer: db,
      exec: {
        command: ["gosu", psqlDaemonUser, "postgres"],
        env: dbEnv,
      },
      ready: {
        display: 'Database',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, psqlPort, {
            successMessage: '',
            errorMessage: ''
          }),
      },
      requires: [],
    })
    .addOneshot('db-migrate', {
      exec: {
        command: ['deno', 'run',
          '--allow-net', '--allow-read', '--allow-env', '--allow-write',
          'migrate-db.ts'],
        env: mainEnv
      },
      subcontainer: mainC,
      requires: ['db']
    })
    .addDaemon('primary', {
      subcontainer: mainC,
      exec: {
        command: ["deno", "run", "--allow-all", "main.ts"],
        cwd: '/app',
        env: mainEnv
      },
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: ['db', 'db-migrate'],
    })
})
