#!/usr/bin/env node
const { Octokit } = require("@octokit/core");
const sodium = require('tweetsodium');
const octokit = new Octokit({ auth: `${process.env.GITHUB_ACCESS_TOKEN}` });
const { IAMClient, ListAccessKeysCommand, CreateAccessKeyCommand, DeleteAccessKeyCommand, ListAccountAliasesCommand} = require("@aws-sdk/client-iam");
const { STSClient, GetCallerIdentityCommand } = require( "@aws-sdk/client-sts");
const iamClient = new IAMClient();
const stsClient = new STSClient();

const main = async () => {
  const repos = await octokit.request('GET /users/{username}/repos', {
    username: 'mkoelle'
  })
  const aws_repos = repos.data.filter(repo => repo.topics.includes('aws'))
  const env = await getAccountEnv()
  Promise.all(
    aws_repos.map(async repo => {
      console.log(`updating ${env} deployment credentials for ${repo.name}`)
      await createEnvironment(repo.name, env);
      const account = await getAccountId()
      const accessKey = await generateNewAccessKey()
      await putEnvironmentSecret(repo.id, env, "AWS_ACCOUNT", account);
      await putEnvironmentSecret(repo.id, env, "AWS_ACCESS_KEY_ID", accessKey.AccessKeyId);
      await putEnvironmentSecret(repo.id, env, "AWS_SECRET_ACCESS_KEY", accessKey.SecretAccessKey);
      deleteOldAccessKey(accessKey.AccessKeyId)
    })
  )
}

async function createEnvironment(repo, name) {
  await octokit.request('PUT /repos/{owner}/{repo}/environments/{environment_name}', {
    owner: 'mkoelle',
    repo: repo,
    environment_name: name
  });
}

async function getAccountId() {
  const response = await stsClient.send(new GetCallerIdentityCommand());
  return response.Account
}

async function getAccountEnv() {
  const response = await iamClient.send(new ListAccountAliasesCommand({}));
  const splitAlias = response.AccountAliases[0].split('-')
  return splitAlias[splitAlias.length-1]
}

async function putEnvironmentSecret(repoId, environment, name, secret) {
  const response = await octokit.request('GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key', {
    repository_id: repoId,
    environment_name: environment
  })
  const encrypted = encryptStringWithKey(response.data.key, secret);
  await octokit.request('PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
    repository_id: repoId,
    environment_name: environment,
    secret_name: name,
    encrypted_value: encrypted,
    key_id: response.data.key_id
  });
}

async function generateNewAccessKey() {
  const response = await iamClient.send(new CreateAccessKeyCommand({
    UserName: "AutomatedDeployer"
  }));
  return response.AccessKey
}

async function deleteOldAccessKey(newKeyId) {
  const listKeysResponse = await iamClient.send(new ListAccessKeysCommand({
    UserName: "AutomatedDeployer"
  }));
  const oldKey = listKeysResponse.AccessKeyMetadata.filter(key => key.AccessKeyId !== newKeyId)
  if (oldKey.length === 0) return
  oldKey.forEach(async key => {
    await iamClient.send(new DeleteAccessKeyCommand({
      UserName: "AutomatedDeployer",
      AccessKeyId: key.AccessKeyId
    }));
  })
}

function encryptStringWithKey(key, message) {
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(message);
  const keyBytes = Buffer.from(key, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString('base64');
  return encrypted;
}

main()
