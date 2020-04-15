alias aws="aws2"
user="$USER"
region='us-east-1'
domain="mkoelle.com"
loggroup_policy=`cat hosted-zone-loggroup-policy.json`
export AWS_DEFAULT_REGION=$region
export AWS_REGION=$region

set -x

aws cloudformation deploy \
  --region ${region} \
  --template-file hosted-zone-loggroup.yaml \
  --stack-name hostedzone-loggroup \
  --tags \
      mkoelle:team=core \
      mkoelle:product=hyperbase-base \
      mkoelle:createdBy=${user}

LogGroupArn=$(aws cloudformation list-exports --query "Exports[?Name=='HostedZone-LogGroup-Arn'].Value" --output text)
loggroup_policy=${loggroup_policy//'__LogGroupArn__'/${LogGroupArn}}

aws logs put-resource-policy \
  --policy-name route53-log-policy \
  --policy-document "${loggroup_policy}"

aws cloudformation deploy \
  --region ${region} \
  --template-file hosted-zone.yaml \
  --stack-name ${domain//'.'/'-'}-hostedzone \
  --parameter-overrides \
    Domain=${domain} \
    LogGroupArn=${LogGroupArn} \
  --tags \
      mkoelle:team=core \
      mkoelle:product=hyperbase-base \
      mkoelle:createdBy=${user}