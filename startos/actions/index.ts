import { sdk } from '../sdk'
import { adminUser } from './adminUser'

export const actions =
  sdk.Actions.of()
    .addAction(adminUser)
