import postgres from 'postgres'
import { unsafeReadStore } from '../fileModels/store.json'

export const psqlDaemonUser = "postgres"
export const psqlHost = "localhost"
export const psqlUser = "postgres"
export const psqlPort = 5432

export class DB {
  private static sql = postgres({
    host: psqlHost,
    port: psqlPort,
    user: psqlUser,
    db: psqlUser,
    password: async () => {
      const store = await unsafeReadStore()
      const pw: string = store?.db_pass
      return pw
    },
  })

  private static usersTable = this.sql`bewcloud_users`

  static getUsers = async () => {
    return this.sql`
      SELECT *
      FROM ${this.usersTable}
      `
  }

  static getAdminUserId = async (): Promise<string> => {
    return this.sql`
      SELECT id
      FROM ${this.usersTable}
      WHERE extra->>'is_admin' = 'true'
      `.values().then(res => res[0][0] as string)
  }

  static createUser =
    async (
      email: string, pwHash: string
    ): Promise<string> => {
      const em = this.sql`${email}`
      const pw = this.sql`${pwHash}`

      return this.sql`
      INSERT INTO ${this.usersTable} (email, hashed_password, extra)
      VALUES (${em}, ${pw}, '{ "isAdmin": true }')
      RETURNING id
      `.values().then(res => res[0][0] as string)
    }

  static updateUserPassword =
    async (
      uuid: string, pwHash: string
    ) => {
      const id = this.sql`${uuid}`
      const pw = this.sql`${pwHash}`

      return this.sql`
      UPDATE ${this.usersTable}
      SET hashed_password = ${pw}
      WHERE id = ${id}
      `
    }

  static helth = async () => {
    return this.sql`SELECT 1`.simple()
  }
}
