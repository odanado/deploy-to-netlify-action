import { spawn } from "child_process";
import * as core from "@actions/core";
import * as github from "@actions/github";

type Inputs = {
  DIST_DIR: string;
  NETLIFY_SITE_ID: string;
  NETLIFY_AUTH_TOKEN: string;
};

function loadInputs(): Inputs {
  return {
    DIST_DIR: core.getInput("dist-dir"),
    NETLIFY_SITE_ID: core.getInput("netlify-site-id"),
    NETLIFY_AUTH_TOKEN: core.getInput("netlify-auth-token")
  };
}

const token = process.env.GITHUB_TOKEN!;

const clinet = new github.GitHub(token);

function main(): void {
  const inputs = loadInputs();
  console.log("Hello!");

  const netlify = spawn(
    "yarn",
    ["netlify", "deploy", `--dir=${inputs.DIST_DIR}`],
    {
      env: {
        NETLIFY_SITE_ID: inputs.NETLIFY_SITE_ID,
        NETLIFY_AUTH_TOKEN: inputs.NETLIFY_AUTH_TOKEN
      }
    }
  );

  netlify.stdout.on("data", (data: string) => {
    console.log(`stdout: ${data}`);
    const matched = data.match("Live Draft URL: (.*)");
    if (matched) {
      const { repo, owner } = github.context.repo;
      const number = github.context.payload.pull_request?.number;
      if (!number) return;
      const draftUrl = matched[1];
      clinet.issues.createComment({
        body: `Deployed: ${draftUrl}`,
        repo,
        owner,
        number: number
      });
    }
  });
  netlify.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });
}

main();
