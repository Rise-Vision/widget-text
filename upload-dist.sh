git clone git@github.com:Rise-Vision/private-keys.git
mv private-keys ..
gcloud auth activate-service-account 452091732215@developer.gserviceaccount.com --key-file ../private-keys/storage-server/rva-media-library-ce0d2bd78b54.json

cp -r dist text
gsutil -m cp -r text gs://install-versions.risevision.com/widgets/
gsutil -m acl -r ch -u AllUsers:R gs://install-versions.risevision.com/widgets/text
gsutil -m setmeta -r -h Cache-Control:private,max-age=0 gs://install-versions.risevision.com/widgets/text