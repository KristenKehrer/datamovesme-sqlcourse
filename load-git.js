const prompt = require('prompt'),
  { execSync } = require('child_process'),
  packageJson = require('./package.json'),
  args = require('minimist')(process.argv.slice(2))

prompt.start();

const schema = {
  properties: {
    username: { required: true },
    password: { required: true, hidden: true, replace: '*' }
  }
}

const url = args.kristen ? packageJson.repository.url : args.paul ? packageJson.alternateRepository.url : null
if (!url) {
  console.error('Call load-git with --kristen or --paul')
  process.exit(1)
}

prompt.get(schema, function (err, result) {
  const urlWithCreds = url.replace('https://', `https://${result.username}:${result.password}@`)
  console.log(`Setting git origin url to ${urlWithCreds.replace(result.password, '<PASSWORD HIDDEN>')}`)
  execSync(`git remote set-url origin ${urlWithCreds}`)
});