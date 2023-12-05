module.exports = {
  apps : [{
    name: 'api',
    script: 'pnpm mocker ./src/mockjs --port 30003',
  },{
    name: 'app',
    script: 'dist/app.js',
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
