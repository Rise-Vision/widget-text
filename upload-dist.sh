cp -r dist text
gsutil -m cp -r text gs://install-versions.risevision.com/widgets/
gsutil -m acl -r ch -u AllUsers:R gs://install-versions.risevision.com/widgets/text
gsutil -m setmeta -r -h Cache-Control:private,max-age=0 gs://install-versions.risevision.com/widgets/text
