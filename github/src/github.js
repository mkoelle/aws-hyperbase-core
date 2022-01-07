const { Octokit } = require("@octokit/core");
const { encryptStringWithKey } = require("./encryption");
const octokit = new Octokit({ auth: `${process.env.GITHUB_ACCESS_TOKEN}` });

async function getReposWithTopic(user,topic) {
  const repos = await octokit.request('GET /users/{username}/repos', {
    username: user
  });
  const aws_repos = repos.data.filter(repo => repo.topics.includes(topic));
  return aws_repos;
}
exports.getReposWithTopic = getReposWithTopic;

async function createEnvironment(repo, name) {
  await octokit.request('PUT /repos/{owner}/{repo}/environments/{environment_name}', {
    owner: 'mkoelle',
    repo: repo,
    environment_name: name
  });
}
exports.createEnvironment = createEnvironment;

async function putEnvironmentSecret(repoId, environment, name, secret) {
  const response = await octokit.request('GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key', {
    repository_id: repoId,
    environment_name: environment
  });
  const encrypted = encryptStringWithKey(response.data.key, secret);
  await octokit.request('PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
    repository_id: repoId,
    environment_name: environment,
    secret_name: name,
    encrypted_value: encrypted,
    key_id: response.data.key_id
  });
}
exports.putEnvironmentSecret = putEnvironmentSecret;
