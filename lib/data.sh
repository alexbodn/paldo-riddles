#curl -H "Content-Type: application/json" -X POST -d '{"slug": "no-body", "question": "I have a head & no body, but I do have a tail. What am I?", "answer": "A coin"}' http://localhost:3000/riddle
#curl -H "Content-Type: application/json" -X POST -d '{"slug": "see-saw", "question": "We see it once in a year, twice in a week, but never in a day. What is it?", "answer": "The letter E"}' http://localhost:3000/riddle
#curl -H "Content-Type: application/json" -X POST -d '' http://localhost:3000/messages
##Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ5NDUyMjUxLCJleHAiOjE2NTAwNTcwNTF9.gsGQrI-d2_wXwpW99pihhx1VvAymPg9jjHG0ZfBYMJU
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ5NDk4NzQwLCJleHAiOjE2NTAxMDM1NDB9.MZjAsKdXMGMqmJRW07aGmVxVfU3A8pIS75RKg58yG1k"
PAYLOAD="{\"TimeSent\":\"20220318T202201UTC\",\"TimeReceived\":\"20220318T202201UTC\",\"SmsSid\":\"SM53263d7713cfd391b84fbc738dbebb46\",\"SmsStatus\":\"received\",\"NumSegments\":\"1\",\"From\":\"+972515010718\",\"AccountSid\":\"AC53d39b824a6964d2db70a2c71ded1a65\",\"To\":\"+14094055673\",\"Body\":\"שוב\",\"NumMedia\":\"0\"}"
#echo ${TOKEN}
curl -D - -H "Content-Type: application/json" -H "Authorization: Token ${TOKEN}" -X POST -d "${PAYLOAD}" http://localhost:3000/messages
