import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { createDb } from './db'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  createDb,
  setInterfaces,
  setDependencies,
  actions
)

export const uninit = sdk.setupUninit(versionGraph)
