const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
var base64 = require('js-base64').Base64;

try {
  const issue_title = core.getInput('issue-title');
  const issue_body = core.getInput('issue-body');
  const issue_number = core.getInput('issue-number');
  const repo_token = core.getInput('repo-token');

  const issue_metadata = JSON.parse(issue_body);
  const buggy_file_path = issue_metadata['buggy_file_path'];
  const repo_url = issue_metadata['repo_url'];
  get_file(repo_token, repo_url, buggy_file_path);

  console.log(`issue_number: ${issue_number}`);
  console.log(`issue_body: ${issue_body}`);
  console.log(`issue_title: ${issue_title}`);
} catch (error) {
  core.setFailed(error.message);
}

async function get_file(access_token, repo_url, buggy_file_path) {
    const user = repo_url.split('/')[3];
    const repo = repo_url.split('/')[4];
    try {
        url = `https://api.github.com/repos/${user}/${repo}/contents/${buggy_file_path}`
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${access_token}`
            }
        });
        let data = await response.json();
        console.log(data);
        console.log(base64.decode(data.content))
        return data;
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
