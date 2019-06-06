import { readdir as readRootFolder, lstatSync } from 'fs-extra'

import readdir from 'recursive-readdir'
import hashes from './utils/hashes'
import upload from './upload'
import deploy from './deploy'
import { getNowIgnore } from './utils'

export { EVENTS } from './utils'

export class DeploymentError extends Error {
  constructor(err: { code: string; message: string }) {
    super(err.message)
    this.code = err.code
    this.name = 'DeploymentError'
  }

  code: string
}

export default async function* createDeployment(path: string | string[], options: DeploymentOptions = {}): AsyncIterableIterator<any> {
  if (typeof path !== 'string' && !Array.isArray(path)) {
    throw new DeploymentError({
      code: 'missing_path',
      message: 'Path not provided'
    })
  }

  if (typeof options.token !== 'string') {
    throw new DeploymentError({
      code: 'token_not_provided',
      message: 'Options object must include a `token`'
    })
  }

  const isDirectory = !Array.isArray(path) && lstatSync(path).isDirectory()

  // Get .nowignore
  let rootFiles
  
  if (isDirectory && !Array.isArray(path)) {
    rootFiles = await readRootFolder(path)
  } else if (Array.isArray(path)) {
    rootFiles = path
  } else {
    rootFiles = [path]
  }
  
  let ignores: string[] = await getNowIgnore(rootFiles, path)

  let fileList

  if (isDirectory && !Array.isArray(path)) {
    // Directory path
    fileList = await readdir(path, ignores)
  } else if (Array.isArray(path)) {
    // Array of file paths
    fileList = path
  } else {
    // Single file
    fileList = [path]
  }

  const files = await hashes(fileList)

  yield { type: 'hashes-calculated', payload: files }

  for await(const event of upload(files, options.token, options.teamId)) {
    yield event
  }

  yield { type: 'all-files-uploaded', payload: files }

  const {
    token,
    teamId,
    defaultName,
    ...metadata
  } = options

  try {
    for await(const event of deploy(files, {
      totalFiles: files.size,
      token,
      isDirectory,
      path,
      teamId,
      defaultName,
      metadata
    })) {
      yield event
    }
  } catch (e) {
    yield { type: 'error', payload: e }
  }
}