# Installs the custom cert provider from
# https://github.com/binxio/cfn-certificate-provider
alias aws="aws2"
user="$USER"
region='us-east-1'
export AWS_DEFAULT_REGION=$region
export AWS_REGION=$region

git clone https://github.com/binxio/cfn-certificate-provider.git
pushd cfn-certificate-provider
  aws cloudformation deploy \
    --capabilities CAPABILITY_IAM \
    --stack-name cfn-certificate-provider \
    --template-file cloudformation/cfn-resource-provider.yaml \
    --tags \
        mkoelle:team=core \
        mkoelle:product=hyperbase-base \
        mkoelle:createdBy=${user}

popd
rm -rf cfn-certificate-provider