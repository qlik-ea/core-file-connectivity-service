const request = require('supertest'); // eslint-disable-line import/no-extraneous-dependencies

async function run() {
  const url = 'http://localhost:3000/v1';

  const res = await request(url).post('/connections')
    .send({
      connector: 'GoogleDrive',
      params: { fileName: 'airports.csv' },
    })
    .expect(200);


  await request(url).get(res.text).expect(401);

  console.log(`Authentication is needed for google drive goto: ${url}${res.text}/authentication`);


  const interval = setInterval(async () => {
    const authRes = await request(url).get(res.text);

    if (authRes.statusCode === 200) {
      clearInterval(interval);
      console.log(authRes.body.toString());
    }
  }, 1000);
}

run();