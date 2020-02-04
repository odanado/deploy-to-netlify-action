"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function loadInputs() {
    return {
        DIST_DIR: core.getInput("dist-dir"),
        NETLIFY_SITE_ID: core.getInput("netlify-site-id"),
        NETLIFY_AUTH_TOKEN: core.getInput("netlify-auth-token"),
        GITHUB_TOKEN: core.getInput("github-token")
    };
}
function main() {
    const inputs = loadInputs();
    const clinet = new github.GitHub(inputs.GITHUB_TOKEN);
    console.log("cwd", process.cwd);
    const netlify = child_process_1.spawn("./node_modules/.bin/netlify", ["deploy", "--json", `--dir=${inputs.DIST_DIR}`], {
        env: {
            NETLIFY_SITE_ID: inputs.NETLIFY_SITE_ID,
            NETLIFY_AUTH_TOKEN: inputs.NETLIFY_AUTH_TOKEN
        }
    });
    const lines = [];
    netlify.stdout.on("data", (data) => {
        lines.push(data.toString());
    });
    netlify.on("close", () => {
        var _a, _b, _c;
        const deployResult = JSON.parse(lines.join("\n"));
        const repo = (_a = github.context.payload.repository) === null || _a === void 0 ? void 0 : _a.name;
        const owner = (_b = github.context.payload.repository) === null || _b === void 0 ? void 0 : _b.owner.login;
        const number = (_c = github.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.number;
        if (!number || !owner || !repo)
            return;
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
