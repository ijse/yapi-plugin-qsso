const request = require('request');

module.exports = function (options) {
  const { loginUrl, emailPostfix } = options;

  this.bindHook('third_login', (ctx) => {
    let token = ctx.request.body.token || ctx.request.query.ticket;
    return new Promise((resolve, reject) => {
      request({
          uri: loginUrl,
          method: 'GET',
          qs: {
            ticket: token,
            service: ctx.headers['referer'] + ctx.path.substring(1),
          }
      }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            let name =  (/<cas:user>(.*)<\/cas:user>/mi.exec(response.body) || [])[1]
            if (!name) {
                reject(new Error(response.body))
            }

            let ret = {
                email: name + emailPostfix,
                username: name
            }

            resolve(ret)
        }

        reject(error);
      });
    });
  })
}
