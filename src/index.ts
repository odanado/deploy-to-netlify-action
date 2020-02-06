import path from "path";

import * as core from "@actions/core";
import * as github from "@actions/github";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Netlify = require("netlify");

type Inputs = {
  DIST_DIR: string;
  NETLIFY_SITE_ID: string;
  NETLIFY_AUTH_TOKEN: string;
  GITHUB_TOKEN: string;
};

function loadInputs(): Inputs {
  return {
    DIST_DIR: core.getInput("dist-dir"),
    NETLIFY_SITE_ID: core.getInput("netlify-site-id"),
    NETLIFY_AUTH_TOKEN: core.getInput("netlify-auth-token"),
    GITHUB_TOKEN: core.getInput("github-token")
  };
}

type DeployResult = {
  deployUrl: string;
};

async function deploy(inputs: Inputs, isProd: boolean): Promise<DeployResult> {
  const client = new Netlify(inputs.NETLIFY_AUTH_TOKEN);

  const distDir = path.resolve(process.cwd(), inputs.DIST_DIR);
  const res = client.deploy(inputs.NETLIFY_SITE_ID, distDir, {
    draft: !isProd
  });
  console.log(res);
  return {
    deployUrl: res.deploy.deploy_ssl_url
  };
}

async function main(): Promise<void> {
  const inputs = loadInputs();

  const clinet = new github.GitHub(inputs.GITHUB_TOKEN);

  const deployResult = await deploy(inputs, false);

  const repo = github.context.payload.repository?.name;
  const owner = github.context.payload.repository?.owner.login;
  const number = github.context.payload.pull_request?.number;

  if (!number || !owner || !repo) return;
  const draftUrl = deployResult.deployUrl;
  clinet.issues.createComment({
    body: `Deployed: ${draftUrl}`,
    repo,
    owner,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: number
  });
}

main();
