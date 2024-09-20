#/bin/bash

npm run predeploy
npm run start &
SERVER_PID=$!

rm -fR ./scraped

# give the server some time to start
sleep 3

wget --mirror --convert-links --adjust-extension --page-requisites --no-parent --no-host-directories --recursive --domains=localhost -P ./scraped --debug http://localhost:8888

find scraped -name "*.html" -exec sed -i '' 's/\&lt;/</g; s/\&gt;/>/g' {} +

echo "Killing all child process...(PID $SERVER_PID - I am $$)"

ps

# kill npm processes started by this script:
ps | awk '$4 == "npm" {print $1}' | xargs kill


