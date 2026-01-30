Analytical Platform (Node.js + MongoDB)

1) Install
npm install

2) Seed demo data (30 days hourly)
npm run seed

3) Run
npm start

Open
localhost:3000

API
GET /api/measurements?field=field1&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&limit=200
GET /api/measurements/metrics?field=field1&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
