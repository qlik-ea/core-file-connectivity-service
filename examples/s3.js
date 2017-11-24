const Outhaul = require('../src/outhaul.js');
const request = require('supertest');

const S3Strategy = require('../src/strategies/s3/s3.js');
const logger = require('../src/logger').get();

async function run() {
  const S3 = new S3Strategy();

  const strategies = [
    S3,
  ];

  const outhaul = Outhaul({
    port: 3000,
    strategies,
  });

  outhaul.start();

  const url = 'http://localhost:3000';

  const accessKeyId = 'AKIAJCVKQ6HEWECLXZCA';
  const secretAccessKey = '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';
  const bucketName = 'stefanenberg';
  const fileName = 'airports.csv';
  const region = 'eu-west-2';

  const res = await request(url).post('/connections/add')
    .send({
      connector: 'S3',
      params: [accessKeyId, secretAccessKey, bucketName, fileName, region],
    })
    .expect(200);

  const authRes = await request(url).get(res.text);

  logger.info(authRes.body.toString());
}

run();
