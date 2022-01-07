#!/usr/bin/env node
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `${process.env.GITHUB_ACCESS_TOKEN}` });

const main = async () => {
    await octokit.request('GET /users/{username}/repos', {
        username: 'mkoelle'
      })
}

main()