const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
var base64 = require('js-base64').Base64;
const { Octokit } = require("@octokit/core");
const { createPullRequest } = require("octokit-plugin-create-pull-request");
const MyOctokit = Octokit.plugin(createPullRequest);

async function run() {
    try {
        const issue_title = core.getInput('issue-title');
        const issue_body = core.getInput('issue-body');
        const issue_number = core.getInput('issue-number');
        const repo_token = core.getInput('repo-token');
        
        const issue_metadata = JSON.parse(issue_body);
        const buggy_file_path = issue_metadata['buggy_file_path'];
        const repo_url = issue_metadata['repo_url'];
        var file = await get_file(repo_token, repo_url, buggy_file_path);
        create_pr(repo_token, repo_url, buggy_file_path, issue_title, issue_number, file);
    } catch (error) {
        core.setFailed(error.message);
    }
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

async function create_pr(access_token, repo_url, buggy_file_path, issue_title, issue_number, file) {
    const user = repo_url.split('/')[3];
    const repo = repo_url.split('/')[4];
    const fix_title = `PERF: Fix ${issue_title}`;
    const branch_name = 'test-branch-' + (new Date()).getTime();

    const octokit = new MyOctokit({
        auth: access_token,
    });

    octokit
    .createPullRequest({
        owner: user,
        repo: repo,
        title: fix_title,
        body: `Auto-generated PR fixing issue #${issue_number}.`,
        head: branch_name,
        base: "main",
        update: false,
        forceFork: false,
        changes: [
            {
                files: {
                    buggy_file_path: file + '\n',
                },
                commit: fix_title,
            },
        ],
    })
    .then((pr) => console.log(pr.data.number));
}

run();