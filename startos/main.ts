import { configFile } from './fileModels/config'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { T } from '@start9labs/start-sdk'

export const main = sdk.setupMain(async ({
  effects,
  started
}: {
  effects: T.Effects,
  started: any
}) => {
  console.info('### Starting Bewcloud! ###')

  const dbEnv = {
    POSTGRESQL_HOST: "localhost",
    POSTGRESQL_USER: "postgres",
    POSTGRES_PASSWORD: "postgres",
    POSTGRESQL_PORT: `${5432}`,
    POSTGRESQL_DBNAME: "bewcloud",
    // POSTGRESQL_CAFILE: "",
  }
  const dbMounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: 'db',
      mountpoint: '/var/lib/postgresql/data',
      readonly: false
    })
    .mountAssets({
      subpath: "db",
      mountpoint: "/docker-entrypoint-initdb.d/",
    })
  const db = await sdk.SubContainer.of(effects,
    { imageId: "db" },
    dbMounts,
    "db"
  )
  await db.execFail(['docker-ensure-initdb.sh'], {
    env: dbEnv,
  })

  const mainEnv = {
    ...dbEnv,
    PORT: `${uiPort}`,
    JWT_SECRET:
      "d795e2ebf594755bb69f6fdcf493bb6dd672b88fedfa9799182c1c4519da97b0087dbe0559667239d36f39beb5fe76a15c6c440177656ac320c4d361b5d12763",
    PASSWORD_SALT:
      "3047512cc45d85a6ce65f9a0703785cfa36d789df49aa8f4a514f0d2fa3ac4fe"
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
        command: ["gosu", "postgres", "postgres"],
        // command: ["docker-entrypoint.sh"],
        // command: ["gosu", "postgres", "postgres",
        //   "-c", "logging_collector=on"],
        env: dbEnv,
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 5432, {
            successMessage: '',
            errorMessage: ''
          }),
      },
      requires: [],
    })
    .addOneshot('create_db', {
      exec: {
        command: [
          'psql', '-U', 'postgres',
          '-f', '/docker-entrypoint-initdb.d/create_db.sql'
        ],
        env: dbEnv
      },
      subcontainer: db,
      requires: ['db']
    })
    .addOneshot('db-migrate', {
      exec: {
        command: ['deno', 'run',
          '--allow-net', '--allow-read', '--allow-env', '--allow-write',
          'migrate-db.ts'],
        env: dbEnv
      },
      subcontainer: mainC,
      requires: ['create_db']
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
