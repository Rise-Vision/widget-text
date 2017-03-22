mkdir -p dist/scripts/greensock/js
curl "http://s3.amazonaws.com/rise-common/scripts/greensock/ThrowPropsPlugin.min.js" -o dist/scripts/greensock/js/ThrowPropsPlugin.min.js

mkdir -p dist/jquery
curl "http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js" -o dist/jquery/jquery.min.js

mkdir -p dist/gadgets
curl --compressed "http://rvashow2.appspot.com/gadgets/gadgets.min.js" -o dist/gadgets/gadgets.min.js