import { spawn } from "child_process";
import * as core from "@actions/core";
import * as github from "@actions/github";

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

function main(): void {
  const inputs = loadInputs();

  const clinet = new github.GitHub(inputs.GITHUB_TOKEN);

  const netlify = spawn(
    "./node_modules/.bin/netlify",
    ["deploy", "--json", `--dir=${inputs.DIST_DIR}`],
    {
      env: {
        NETLIFY_SITE_ID: inputs.NETLIFY_SITE_ID,
        NETLIFY_AUTH_TOKEN: inputs.NETLIFY_AUTH_TOKEN
      }
    }
  );

  const lines: string[] = [];

  netlify.stdout.on("data", (data: string) => {
    lines.push(data.toString());
  });

  netlify.on("close", () => {
    const deployResult = JSON.parse(lines.join("\n"));

    const repo = github.context.payload.repository?.name;
    const owner = github.context.payload.repository?.owner.login;
    const number = github.context.payload.pull_request?.number;

    if (!number || !owner || !repo) return;
    const draftUrl = deployResult["deploy_url"];
    clinet.issues.createComment({
      body: `Deployed: ${draftUrl}`,
      repo,
      owner,
      number: number
    });
  });
}

main();
