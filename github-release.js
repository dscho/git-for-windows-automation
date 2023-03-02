const createRelease = async (context, token, owner, repo, tagName, rev, name, body, draft, prerelease) => {
  const githubApiRequest = require('./github-api-request')
  return await githubApiRequest(
    context,
    token,
    'POST',
    `/repos/${owner}/${repo}/releases`, {
      tag_name: tagName,
      target_commitish: rev,
      name,
      body,
      draft: draft === undefined ? true : draft,
      prerelease: prerelease === undefined ? true : prerelease
    }
  )
}

const updateRelease = async (context, token, owner, repo, releaseId, parameters) => {
  const githubApiRequest = require('./github-api-request')
  return await githubApiRequest(
    context,
    token,
    'PATCH',
    `/repos/${owner}/${repo}/releases/${releaseId}`,
    parameters
  )
}

const uploadReleaseAsset = async (context, token, owner, repo, releaseId, name, path) => {
  const httpsRequest = require('./https-request')
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Path': path || name
  }
  const answer = await httpsRequest(
    context,
    'uploads.github.com',
    'POST',
    `/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${name}`,
    undefined,
    headers)
  if (answer.error) throw answer.error
  return answer
}

const getWorkflowRunArtifactsURLs = async (context, token, owner, repo, workflowRunId) => {
  const githubApiRequest = require('./github-api-request')
  const { artifacts } = await githubApiRequest(
    context,
    token,
    'GET',
    `/repos/${owner}/${repo}/actions/runs/${workflowRunId}/artifacts`
  )
  return artifacts.reduce((map, e) => {
    map[e.name] = e.archive_download_url
    return map
  }, {})
}

const downloadAndUnZip = async (token, url, name) => {
  const { spawnSync } = require('child_process')
  const auth = token ? ['-H', `Authorization: Bearer ${token}`] : []
  const tmpFile = `${process.env.RUNNER_TEMP || process.env.TEMP || '/tmp'}/${dest}.zip`
  const curl = spawnSync('curl', [...auth, '-Lo', tmpFile, url])
  if (curl.error) throw curl.error
  const { mkdirSync, rmSync } = require('fs')
  await mkdirSync(name, { recursive: true })
  const unzip = spawnSync('unzip', ['-d', name, tmpFile])
  if (unzip.error) throw unzip.error
  rmSync(tmpFile)
}

const getGitArtifacts = async (context, token, owner, repo, git_artifacts_i686_workflow_run_id, git_artifacts_x86_64_workflow_run_id) => {

}

const uploadGitArtifacts = async (context, token, owner, repo, releaseId) => {
}

module.exports = {
  createRelease,
  updateRelease,
  uploadReleaseAsset,
  getWorkflowRunArtifactsURLs,
  downloadAndUnZip,
  getGitArtifacts,
  uploadGitArtifacts
}