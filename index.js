const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  const issue_title = core.getInput('issue-title');
  const issue_body = core.getInput('issue-body');
  const issue_number = core.getInput('issue-number');
  const repo_token = core.getInput('repo-token');

  get_file(repo_token);

  console.log(`issue_number: ${issue_number}`);
  console.log(`issue_body: ${issue_body}`);
  console.log(`issue_title: ${issue_title}`);
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

async function get_file(access_token) {
    try {
        url = "https://api.github.com/repos/glGarg/JuniorDevBot/contents/action.yml"
        let response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {}'.format(access_token)
            }
        });
        let data = await response.json();
        console.log(data);
        return data;
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
