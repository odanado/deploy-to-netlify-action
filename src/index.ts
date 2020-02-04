import { spawn } from "child_process";
import * as core from "@actions/core";

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

function main(): void {
  const inputs = loadInputs();
  console.log(inputs);
  console.log("Hello!");
  /*
  const netlify = spawn(
    "yarn",
    ["netlify", "deploy", `-dir=${inputs.DIST_DIR}`],
    {
      env: {
        NETLIFY_SITE_ID: inputs.NETLIFY_SITE_ID,
        NETLIFY_AUTH_TOKEN: inputs.NETLIFY_AUTH_TOKEN
      }
    }
  );

  netlify.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  });
  */
}

main();
