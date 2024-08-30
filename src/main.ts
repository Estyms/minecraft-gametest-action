import * as core from '@actions/core'
import { run } from './app'

const main = async (): Promise<void> => {
  
  await run({
    version: core.getInput("version", {required: true}),
    modPath: core.getInput("modPath", {required: true}),
    serverPropertiesPath: core.getInput("serverPropertiesPath"),
    configPath: core.getInput("configPath")
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
