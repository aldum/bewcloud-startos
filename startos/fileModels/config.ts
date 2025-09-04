import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string, boolean, number,
  arrayOf, literals } = matches

const apps = literals(
  'news',
  'notes',
  'photos',
  'expenses',
)

const shape = object({
  auth: object({
    baseUrl: string.onMismatch('http://localhost:8000'),
    allowSignups: boolean.onMismatch(false),
    enableEmailVerification: boolean.onMismatch(false),
    enableForeverSignup: boolean.onMismatch(true),
    enableMultiFactor: boolean.onMismatch(false),
    allowedCookieDomains: arrayOf(string).optional(),
    // If true, the cookie domain will not be strictly set and checked against.
    skipCookieDomainSecurity: boolean.onMismatch(true),
  }),
  files: object({
    rootPath: string,
    // If true, public file sharing will be allowed
    // (still requires a user to enable sharing for a given file or directory)
    allowPublicSharing: boolean,
  }).optional(),
  core: object({
    enabledApps: arrayOf(apps)
      .onMismatch(['news', 'notes', 'photos', 'expenses']),
  }).optional(),
  visuals: object({
    title: string,
    description: string,
    helpEmail: string,
  }).optional(),
  email: object({
    from: string,
    host: string,
    port: number,
  }).optional(),
})

const JsonHelper = FileHelper.json(
  // '/app/bewcloud.config.ts',
  {
    volumeId: 'config',
    subpath: '/bewcloud.config.ts',
  },
  shape,
)

const header = `
import { Config, PartialDeep } from './lib/types.ts'

const config: PartialDeep<Config> =
`
const footer = 'export default config'

export const configFile = FileHelper.raw(
  JsonHelper.path,
  (o: typeof shape._TYPE) => {
    return `${header}
${JsonHelper.writeData(o)}

${footer}`
  },
  JsonHelper.read,
  (value) => {
    // return shape.unsafeCast(value)
    return JsonHelper.validate(value)
  }
)
