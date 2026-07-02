const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");

function run(cmd, cwd = root) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
}

try {
  run("git add -A");
  try {
    run('git commit -m "Deploy to production"');
  } catch {
    console.log("\nNo new changes to commit.\n");
  }
  run("git push origin main");

  run("vercel deploy --prod --yes --local-config apps/demo/vercel.json --project jude-demo");
  run(
    "vercel deploy --prod --yes --local-config apps/marketing/vercel.json --project jude-marketing"
  );

  console.log("\nDeployed to GitHub and Vercel production.\n");
} catch (error) {
  console.error("\nDeploy failed:", error.message);
  process.exit(1);
}
