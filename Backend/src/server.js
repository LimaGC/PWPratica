const config = require('./config');

const app = require('./app');

app.listen(config.PORT, () => {
  // console.log(`APP LISTENING ON: ${config.PORT}`);
});
