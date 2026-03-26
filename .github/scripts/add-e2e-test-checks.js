module.exports = async ({ github, context }) => {
  const result = await github.rest.checks.listForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: process.env.BRANCH_NAME
  });
  const testChecks = (result.data.check_runs || []).filter((check) =>
    check.name.includes('e2e-tests')
  );

  if (!testChecks.length) {
    console.log('No e2e test checks found, aborting');
    return;
  }

  console.log(testChecks);
};
