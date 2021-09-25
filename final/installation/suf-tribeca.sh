cd /home/suf/suf-final/installation/service
node sdata.js &
cd /home/suf/suf-final/installation/sviz
python3 -m http.server 9090 &
cd /home/suf/suf-final/public
python3 -m http.server 9000 &