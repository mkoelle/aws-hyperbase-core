#!/usr/bin/env node

const aws = require("./aws");
const github = require("./github");

const main = async () => {
  const aws_repos = await github.getReposWithTopic('mkoelle', 'aws');
  const env = await aws.getAccountEnv()
  const account = await aws.getAccountId()
  const accessKey = await aws.generateNewAccessKey()
  Promise.all(
    aws_repos.map(async repo => {
      console.log(`updating ${env} deployment credentials for ${repo.name}`)
      await github.createEnvironment(repo.name, env);
      await github.putEnvironmentSecret(repo.id, env, "AWS_ACCOUNT", account);
      await github.putEnvironmentSecret(repo.id, env, "AWS_ACCESS_KEY_ID", accessKey.AccessKeyId);
      await github.putEnvironmentSecret(repo.id, env, "AWS_SECRET_ACCESS_KEY", accessKey.SecretAccessKey);
    })
  )
  aws.deleteOldAccessKey(accessKey.AccessKeyId)
}

main()
