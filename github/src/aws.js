const { IAMClient, ListAccessKeysCommand, CreateAccessKeyCommand, DeleteAccessKeyCommand, ListAccountAliasesCommand} = require("@aws-sdk/client-iam");
const { STSClient, GetCallerIdentityCommand } = require( "@aws-sdk/client-sts");
const iamClient = new IAMClient();
const stsClient = new STSClient();

async function getAccountId() {
  const response = await stsClient.send(new GetCallerIdentityCommand());
  return response.Account;
}
exports.getAccountId = getAccountId;

async function getAccountEnv() {
  const response = await iamClient.send(new ListAccountAliasesCommand({}));
  const splitAlias = response.AccountAliases[0].split('-');
  return splitAlias[splitAlias.length - 1];
}
exports.getAccountEnv = getAccountEnv;

async function generateNewAccessKey() {
  const response = await iamClient.send(new CreateAccessKeyCommand({
    UserName: "AutomatedDeployer"
  }));
  return response.AccessKey;
}
exports.generateNewAccessKey = generateNewAccessKey;

async function deleteOldAccessKeys(newKeyId) {
  const listKeysResponse = await iamClient.send(new ListAccessKeysCommand({
    UserName: "AutomatedDeployer"
  }));
  const oldKey = listKeysResponse.AccessKeyMetadata.filter(key => key.AccessKeyId !== newKeyId);
  if (oldKey.length === 0)
    return;
  oldKey.forEach(async (key) => {
    await iamClient.send(new DeleteAccessKeyCommand({
      UserName: "AutomatedDeployer",
      AccessKeyId: key.AccessKeyId
    }));
  });
}
exports.deleteOldAccessKeys = deleteOldAccessKeys;
