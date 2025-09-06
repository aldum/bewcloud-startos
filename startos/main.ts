import { sdk } from './sdk'
import { Effects } from
  '@start9labs/start-sdk/base/lib/Effects'
import { configFile as bewConfigFile } from './fileModels/config'
import { configFile as davConfigFile } from './fileModels/config-dav'
import { unsafeReadStore } from './fileModels/store.json'
import * as dbSub from './subcontainers/db'
import * as mainSub from './subcontainers/bewcloud'
import * as radSub from './subcontainers/radicale'
import { psqlPort, uiPort, psqlDaemonUser, davPort } from './utils'
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

  const dav = await radSub.getSubcontainer(effects)
  const radUrl = `localhost:${davPort}`
  const fullRadUrl = `http://${radUrl}`

  const mainEnv = await mainSub.getEnv(store)
  const mainC = await mainSub.getSubcontainer(effects)
  exec('chown -R 1993:1993 /media/startos/volumes/main/bewcloud')

  bewConfigFile.write(effects, {
    auth: {
      baseUrl: 'http://localhost:8000',
      allowSignups: false,
      enableEmailVerification: false,
      enableForeverSignup: true,
      enableMultiFactor: false,
      skipCookieDomainSecurity: true,
    },
    contacts: {
      cardDavUrl: fullRadUrl,
    },
    calendar: {
      calDavUrl: fullRadUrl,
    }
  })
  davConfigFile.write(effects, {
    server: {
      hosts: radUrl,
    },
    auth: {
      type: 'http_x_remote_user',
    },
    storage: {
      filesystem_folder: radSub.collectionsPath,
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
    .addDaemon('radicale', {
      subcontainer: dav,
      exec: {
        command: ["/venv/bin/radicale", "--config", radSub.davConfigPath],
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
