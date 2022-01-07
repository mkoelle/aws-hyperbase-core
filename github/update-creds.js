#!/usr/bin/env node
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `${process.env.GITHUB_ACCESS_TOKEN}` });

const main = async () => {
    const repos = await octokit.request('GET /users/{username}/repos', {
        username: 'mkoelle'
      })
    
    const aws_repos= repos.data.filter(repo => repo.topics.includes('aws'))

    Promise.all(
    aws_repos.map(async repo => {
      console.log(repo.name)
      await octokit.request('PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
        repository_id: repo.id,
        environment_name: 'test',
        secret_name: 'AWS_ACCOUNT',
        encrypted_value: 'encrypted_value',
        key_id: 'key_id'
      })
    })
    )
}

main()