# Primarybyte Backend Node Interview

### Description:
There are react frontend application with express backend application.
![App Flow](./doc/app_flow.png)

Express backend application relies on [ProspectAI API](https://apilabs.prospectai.com/docs#/paths/~1api~1v1~1email-verifier/post
) and designed to verify emails.
Backend provides two endpoints:
- GET `/email-verifications` - returns an email verification history.
- POST `/email-verifications` - sends new email to [ProspectAI API](https://apilabs.prospectai.com/docs#/paths/~1api~1v1~1email-verifier/post
  ).

All email verifications results stores to database available in docker stack.
The database schema consist of 2 tables: email and email_verification.

![App Flow](./doc/database_schema.png)

React frontend application allows customer:
* browse email verification history
![App Flow](./doc/mockups/Cards.png)
* preview email verification details
![App Flow](./doc/mockups/Preview.png)
* add verify new email
![App Flow](./doc/mockups/Add.png)

Application infrastructure is launching with docker-compose.yml: `docker-compose up -d`.
Postman Collection is available in [`./postman`](./postman/Email%20Verification%20Api.postman_collection.json) 

### Getting Started
#### Installation
1. Copy `.env.dist` > `.env`
2. Fill `PROSPECT_API_KEY`, `PROSPECT_BASE_URL` with given values.
3. Run `docker-compose up -d`

### Tasks
1. Fill result saving class with necessary fields on `POST:/email-verification`.
2. Implement server side validation for requested email on `POST:/email-verification`.
3. Implement bulk processing on `POST:/email-verification`.
4. Implement server side pagination on `GET:/email-verification`
5. Advanced: implement async processing on `POST:/email-verification` (ideas: queue, db & cron script, redis) 
