cp -r dist text
gsutil rsync -d -r text gs://install-versions.risevision.com/widgets/text
gsutil -m acl -r ch -u AllUsers:R gs://install-versions.risevision.com/widgets/text
gsutil -m setmeta -r -h Cache-Control:private,max-age=0 gs://install-versions.risevision.com/widgets/text
