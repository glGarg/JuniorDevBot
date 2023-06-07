const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
var base64 = require('js-base64').Base64;
const { Octokit } = require('@octokit/core');
const { createPullRequest } = require('octokit-plugin-create-pull-request');
const MyOctokit = Octokit.plugin(createPullRequest);

async function run() {
    try {
        const issue_title = core.getInput('issue-title');
        const issue_body = core.getInput('issue-body');
        const issue_number = core.getInput('issue-number');
        const repo_token = core.getInput('repo-token');
        const pat_token = core.getInput('token');
        console.log(pat_token.substring(0, 5));
        console.log(repo_token.substring(0, 5));
        
        const issue_metadata = JSON.parse(issue_body);
        const buggy_file_path = issue_metadata['buggy_file_path'];
        const repo_url = issue_metadata['repo_url'];
        var file = await get_file(repo_token, repo_url, buggy_file_path);

        var fixed_file = await fix_bug(pat_token, file, issue_metadata['start_line_number'], issue_metadata['bottleneck_call']);
        
        console.log(fixed_file);
        
        create_pr(repo_token, repo_url, buggy_file_path, issue_title, issue_number, file);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function fix_bug(access_token, buggy_code, start_line_number, buggy_function_call)
{
    var auth = await get_deepprompt_auth(access_token);
    var auth_token = auth['access_token'];
    var session_id = auth['session_id'];

    var url = 'https://data-ai-dev.microsoft.com/deepprompt/api/v1/query';
    var intent = 'perf_fix';
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'DeepPrompt-Version': 'v1',
            'Accept': 'application/json',
            'Authorization': `Bearer ${auth_token}`,
            'DeepPrompt-Session-ID': session_id
        },
        body: JSON.stringify({
            'query': 'Can you fix the above perf issue?',
            'intent': intent,
            'context': {
                'source_code': buggy_code,
                'buggy_function_call': buggy_function_call,
                'start_line_number': start_line_number.toString()
            }
        })
    });
    let data = await response.json();
    console.log(data);
}

async function get_deepprompt_auth(access_token) {
    try {
        url = 'https://data-ai-dev.microsoft.com/deepprompt/api/v1/exchange'
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'token': access_token,
                'provider': 'github'
            })
        });
        let auth_token = await response.json();
        return auth_token;
    }
    catch (error) {
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
        let file = base64.decode(data.content);
        return file;
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

    var change = {}
    change[buggy_file_path] = file + '\n';
    octokit.createPullRequest({
        owner: user,
        repo: repo,
        title: fix_title,
        body: `Auto-generated PR fixing issue #${issue_number}.`,
        head: branch_name,
        base: 'main',
        update: false,
        forceFork: false,
        changes: [
            {
                files: change,
                commit: fix_title,
            },
        ],
    });
}

run();