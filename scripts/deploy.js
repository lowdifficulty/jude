const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("git add -A");
  run('git commit -m "Deploy to production"');
  run("git push origin main");
  run("vercel --prod --cwd apps/demo --yes");
  run("vercel --prod --cwd apps/marketing --yes");
  console.log("\nDeployed to GitHub and Vercel production.\n");
} catch (error) {
  console.error("\nDeploy failed:", error.message);
  process.exit(1);
}
