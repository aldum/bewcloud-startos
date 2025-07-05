import { sdk } from '../sdk'
import { storeJson, unsafeReadStore } from '../fileModels/store.json'
import { defaultRandomString, generatePassword, hashPassword } from '../utils/password'
import { uiPort, DB } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  email: Value.dynamicText(async () => {
    const adminExists = await storeJson.read(s => s.admin).once()
    const disabled = adminExists ?
      'You can change the email in the UI'
      : false
    return {
      name: 'Email',
      description: 'Admin email',
      required: true,
      default: null,
      inputmode: 'email',
      disabled: disabled,
      patterns: [
        {
          regex:
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Must be a valid email address',
        },
      ],
    }
  }),
  password: Value.dynamicText(async () => {
    const adminExists = await storeJson.read(s => s.admin).once()

    const label = "Password"
    const min = adminExists ? undefined : 10
    const warn = adminExists ? null :
      "Store the password safely, we will not persist it."
    const disabled = adminExists ? '' : false
    const gen = adminExists ? null : defaultRandomString

    return {
      name: label,
      description: null,
      warning: warn,
      disabled: disabled,
      required: true,
      masked: true,
      minLength: min,
      default: null,
      generate: gen,
      patterns: [],
    }
  }),
  // switch when alpha.10 is out
  // new: Value.hidden<boolean>(),
  new: Value.dynamicToggle(
    async () => {
      return {
        name: "",
        default: true,
        disabled: 'a',
      }
    }
  ),
})

export const adminUser = sdk.Action.withInput(
  'admin-user-ops',
  // metadata
  async ({ effects }) => {
    console.log("metadata read")
    const adminUser =
      await storeJson.read(s => s.admin)
        // .once()
        .const(effects)
    console.log("metadata read done")

    const label = adminUser ?
      "Reset admin password" :
      "Create admin user"

    return {
      name: label,
      description: '',
      warning: null,
      allowedStatuses: adminUser ? 'any' : 'only-running',
      group: null,
      visibility: 'enabled',
    }
  },
  inputSpec,
  // prefill input
  async ({ effects }) => {
    const adminUser =
      await storeJson.read(s => s.admin).once()

    if (adminUser) {
      return {
        email: adminUser.email,
        password: '',
        new: false,
      }
    } else {
      return {
        password: await generatePassword(),
        new: true,
      }
    }
  },
  // run
  async ({ effects, input }) => {
    const store = await unsafeReadStore()
    const salt = store.salt

    const email = input.email as string
    const pass = input.password as string
    const passw_hash: string =
      await hashPassword(pass, salt)
    const newUser = input.new

    if (newUser) {
      const result = await createAdmin(email, pass)

      if (result?.ok) {
        const id = await DB.getAdminUserId()

        const data = {
          admin: {
            email: email,
            password_hash: passw_hash,
            uuid: id,
          }
        }

        await storeJson.merge(effects, data)
        return {
          version: "1",
          title: "Admin user created.",
          message: "Save the password now, we won't be able to show it again!",
          result: {
            name: 'Admin Password',
            type: 'single',
            value: pass,
            description: `Password for admin ${input.email}`,
            copyable: true,
            masked: true,
            qr: false,
          },
        }
      } else {
        console.error(`User creation failed with error: ${result.error}`)
        return {
          version: '1',
          title: 'Failed to create admin user',
          message: null,
          result: null,
        }
      }
    } else {
      const data = {
        admin: {
          password_hash: passw_hash,
        }
      }
      const id = store.admin?.uuid
      if (id) {
        await storeJson.merge(effects, data)
      }

      return {
        version: "1",
        title: "Admin password was reset.",
        message: null,
        result: null,
      }
    }
  }

)

const createAdmin = async (email: string, pass: string) => {
  const url = `http://localhost:${uiPort}/signup`

  const params = new URLSearchParams({
    email: email,
    password: pass,
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const result = await response.text()
    const err = result.match(/Error:/)

    if (response.ok && !err) {
      console.info('Admin create success:', result)
      return {
        ok: true
      }
    } else {
      console.error(`Failed with status ${response.status}:`, result)
      return {
        ok: false,
        error: err,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      error: error,
    }
  }

}
