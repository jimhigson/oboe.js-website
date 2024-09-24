#/bin/bash

# build js/css:
npm run predeploy
npm run start &
SERVER_PID=$!

rm -fR ./docs

# give the server some time to start
sleep 3

# download the site from the running server to a static copy:
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent --no-host-directories --recursive --domains=localhost -P ./docs --debug http://localhost:8888

# changes to template engine since site was created mean <figure is escaped as - unescape it:
# this is just a hack to keep an archived site online 10 years after I wrote it
find docs -name "*.html" -exec sed -i '' 's/\&lt;/</g; s/\&gt;/>/g' {} +

echo "Killing all child process...(PID $SERVER_PID - I am $$)"

ps

# kill npm processes started by this script:
ps | awk '$4 == "npm" {print $1}' | xargs kill


