const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const uuid = require('uuid/v1');
// const passport = require('koa-passport');

function outhaul(options) {
  const app = new Koa();

  const port = options.port;
  const adapters = options.adapters;

  const connections = [];

  const router = new Router();

  app.use(bodyParser());
    // app.use(passport.initialize());
  app.use(router.routes());

  router.get('/health', (ctx) => {
    ctx.response.body = 'ok';
  });

  let appInstance;

  function addConnection(connection) {
    connections.push(connection);

    const uniqueUrl = `/${uuid()}`;

        // console.log(`GET ${uniqueUrl} registerd for ${connection}`);

    router.get(uniqueUrl, async (ctx) => {
      if (connection.authenticated === undefined || connection.authenticated()) {
        ctx.response.body = await connection.getData();
      } else {
        ctx.throw(401, 'Authentication is needed to access this connection.');
      }
    });

    if (connection.authentication) {
      router.get(`${uniqueUrl}/authenticated`, (ctx) => {
        if (connection.authenticated()) {
          ctx.body = 'Authenticated';
        } else {
          ctx.body = 'Unauthorized';
        }
      });

            // router.get(`${uniqueUrl}/authentication`, (ctx, next) => passport.authenticate(connection.getPassportStrategy().name, { scope: connection.scope ? connection.scope() : '' })(ctx, next));
      router.get(`${uniqueUrl}/authentication`, (ctx, next) => connection.authentication(ctx, next));


            // const callbackUrl = `/${connection.getName()}/authentication/callback`;
            //
            // connection.initiatedPassportStrategy(`http://localhost:${port}${callbackUrl}`);
            //
            // router.get(callbackUrl, (ctx, next) => passport.authenticate(connection.getPassportStrategy().name, (err, profile) => {
            //     if (profile) {
            //         ctx.body = 'Success';
            //     } else {
            //         ctx.body = 'Failed to get profile';
            //     }
            // })(ctx, next));

            // passport.use(connection.getPassportStrategy());
    }

    return uniqueUrl;
  }

  router.post('/connections/add', async (ctx) => {
    const input = ctx.request.body;

    if (input.adapter) {
      if (adapters[input.adapter]) {
        const connection = new adapters[input.adapter](...input.params);
        ctx.response.body = addConnection(connection);
      } else {
        ctx.response.body = "Couldn't find adapter";
      }
    } else {
      ctx.response.body = 'Adapter not specified';
    }
  });


  function start() {
    appInstance = app.listen(port);
        // console.log(`Started and listening to port ${port}`);
    return appInstance;
  }

  function close() {
    appInstance.close();
        // console.log('Server Closed()');
  }

  return {
    start,
    close,
    addConnection,
  };
}

module.exports = outhaul;
