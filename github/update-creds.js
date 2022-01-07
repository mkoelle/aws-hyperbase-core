#!/usr/bin/env node
const { Octokit } = require("@octokit/core");
const sodium = require('tweetsodium');
const octokit = new Octokit({ auth: `${process.env.GITHUB_ACCESS_TOKEN}` });

const main = async () => {
    const repos = await octokit.request('GET /users/{username}/repos', {
        username: 'mkoelle'
      })
    
    const aws_repos= repos.data.filter(repo => repo.topics.includes('aws'))

    Promise.all(
    aws_repos.map(async repo => {
      console.log(repo.name)

      await octokit.request('PUT /repos/{owner}/{repo}/environments/{environment_name}', {
        owner: 'mkoelle',
        repo: repo.name,
        environment_name: 'dev'
      })

      const key = await octokit.request('GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key', {
        repository_id: repo.id,
        environment_name: 'dev'
      })

      const encrypted = encryptStringWithKey(key.data.key, 'Im a seeeecret');

      await octokit.request('PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
        repository_id: repo.id,
        environment_name: 'dev',
        secret_name: 'AWS_ACCOUNT',
        encrypted_value: encrypted,
        key_id: key.data.key_id
      })
    })
    )
}

main()

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
