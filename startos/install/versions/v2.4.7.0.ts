import { VersionInfo, IMPOSSIBLE, T } from '@start9labs/start-sdk'

export const v_2_4_7_0 = VersionInfo.of({
  version: '2.4.7:0',
  releaseNotes: '',
  migrations: {
    up: async ({ effects }: { effects: T.Effects }) => {
    },
    down: IMPOSSIBLE,
  },
})
