# Github Automation

## Update Deployment credentials

Will access your aws account, and your github account to update all repositories with the topic `AWS` with deployment environments and secrets.

> ⚠️Does not work with private repos
> TODO: Github REST api used in getUserReposWithTopic does not return private repos. \
> Use graphql endpoint instead.

```sh
# pre-run

# requires a github access token with 'repo' permissions
export GITHUB_ACCESS_TOKEN=[token] # or $env:GITHUB_ACCESS_TOKEN
# if on a vpn that replaces certs
export NODE_TLS_REJECT_UNAUTHORIZED='0'
# log into your aws account
aws sso login [profile]
```

```sh
./src/update-creds.js
```
