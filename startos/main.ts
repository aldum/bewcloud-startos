import { configFile } from './fileModels/config'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import * as dbSub from './subcontainers/db'
import { psqlDaemonUser, psqlUser, sqlPort, uiPort } from './utils'
import { T } from '@start9labs/start-sdk'

export const main = sdk.setupMain(async ({
  effects,
  started
}: {
  effects: T.Effects,
  started: any
}) => {
  console.info('### Starting Bewcloud! ###')

  const store = await storeJson.read().once()
  if (!store) {
    throw new Error("Store is missing!")
  }
  const psqlPass = store.db_pass

  const dbEnv = await dbSub.getEnv(store)
  const db = await dbSub.getSubcontainer(effects)

  const mainEnv = {
    // these are not the same as the DB container's env
    POSTGRESQL_HOST: "localhost",
    POSTGRESQL_USER: psqlUser,
    POSTGRESQL_DBNAME: psqlUser,
    POSTGRESQL_PASSWORD: psqlPass,

    PORT: `${uiPort}`,
    JWT_SECRET: store.jwt_secret,
    PASSWORD_SALT: store.salt,
  }
  const mainC = await sdk.SubContainer.of(
    effects,
    { imageId: 'bewcloud' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'config',
        subpath: '/bewcloud.config.ts',
        mountpoint: '/app/bewcloud.config.ts',
        readonly: false,
        type: 'file',
      }),
    'bewcloud-sub',
  )

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
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, sqlPort, {
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
