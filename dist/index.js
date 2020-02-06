"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Netlify = require("netlify");
function loadInputs() {
    return {
        DIST_DIR: core.getInput("dist-dir"),
        NETLIFY_SITE_ID: core.getInput("netlify-site-id"),
        NETLIFY_AUTH_TOKEN: core.getInput("netlify-auth-token"),
        GITHUB_TOKEN: core.getInput("github-token")
    };
}
async function deploy(inputs, isProd) {
    const client = new Netlify(inputs.NETLIFY_AUTH_TOKEN);
    const distDir = path_1.default.resolve(process.cwd(), inputs.DIST_DIR);
    const res = client.deploy(inputs.NETLIFY_SITE_ID, distDir, {
        draft: !isProd
    });
    console.log(res);
    return {
        deployUrl: res.deploy.deploy_ssl_url
    };
}
async function main() {
    var _a, _b, _c;
    const inputs = loadInputs();
    const clinet = new github.GitHub(inputs.GITHUB_TOKEN);
    const deployResult = await deploy(inputs, false);
    const repo = (_a = github.context.payload.repository) === null || _a === void 0 ? void 0 : _a.name;
    const owner = (_b = github.context.payload.repository) === null || _b === void 0 ? void 0 : _b.owner.login;
    const number = (_c = github.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.number;
    if (!number || !owner || !repo)
        return;
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
