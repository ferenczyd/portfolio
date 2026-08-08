const { spawn } = require('child_process');
const got = require('got');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {PORT: 51236});
const child = spawn('node', ['index.js'], {env});

test('responds to requests', (t) => {
  t.plan(7);
  let complete = false;

  const timeout = setTimeout(() => {
    if (!complete) {
      child.kill();
      t.fail('server did not respond before timeout');
    }
  }, 5000);

  // Wait until the server is ready
  child.stdout.on('data', _ => {
    // Make a request to our app
    (async () => {
      try {
        const response = await got('http://127.0.0.1:51236');
        complete = true;
        clearTimeout(timeout);
        child.kill();
        // No error
        t.false(response.error);
        // Successful response
        t.equal(response.statusCode, 200);
        // Assert portfolio content checks
        t.notEqual(response.body.indexOf("<title>Dominic Ferenczy Portfolio</title>"), -1);
        t.notEqual(response.body.indexOf("Manager - Artificial Intelligence & Automation"), -1);
        t.notEqual(response.body.indexOf("July 2026 - Present"), -1);
        t.notEqual(response.body.indexOf("Personal portfolio"), -1);
        t.notEqual(response.body.indexOf("Personal Projects"), -1);
      } catch (error) {
        complete = true;
        clearTimeout(timeout);
        child.kill();
        t.fail(error.message);
      }
    })();
  });
});
