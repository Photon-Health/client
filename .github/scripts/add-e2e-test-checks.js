module.exports = async ({ github, context }) => {
  const jobName = 'e2e-tests';
  const appJobName = `${jobName} (${process.env.APP_NAME}`;

  const result = await github.rest.checks.listForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: process.env.BRANCH_NAME
  });

  const testChecks = (result.data.check_runs || []).filter((check) => check.name.includes(jobName));
  if (!testChecks.length) {
    throw new Error('No e2e test checks found, aborting');
  }

  console.log(testChecks);

  console.log(appJobName);

  const appCheck = testChecks.find((check) => check.name.includes(appJobName));
  if (!appCheck) {
    throw new Error(`No e2e test check for ${process.env.APP_NAME} found, aborting`);
  }

  console.log(appCheck);
};
