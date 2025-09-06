import { matches, FileHelper } from '@start9labs/start-sdk'
import { collectionsPath } from '../subcontainers/radicale'
const { object, string, literals } = matches

const authLit = [
  'none',
  'htpasswd',
  'remote_user',
  'http_x_remote_user',
  'dovecot',
  'ldap',
  'oauth2',
  'pam',
  'denyall'
] as const

const shape = object({
  server: object({
    hosts: string.onMismatch('localhost:5232'),
  }),
  auth: object({
    type: literals(...authLit).onMismatch('http_x_remote_user'),
  }),

  storage: object({
    filesystem_folder: string.onMismatch(collectionsPath),
  }),
})

export const configFile = FileHelper.ini(
  {
    volumeId: 'config',
    subpath: '/radicale-config',
  },
  shape,
)
