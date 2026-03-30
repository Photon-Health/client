const createCheck = async ({ github, context }) => {
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    name: `e2e-tests (${process.env.APP_NAME})`,
    head_sha: process.env.SHA,
    status: 'in_progress',
    details_url: process.env.DETAILS_URL,
    output: {
      title: `E2E tests (${process.env.APP_NAME})`,
      summary: `Workflow run can be found here: ${process.env.DETAILS_URL}`
    }
  };

  console.log('Payload', JSON.stringify(payload, null, 2));

  const result = await github.rest.checks.create(payload);
  const checkId = result.data.id;
  return checkId;
};

const updateCheck = async ({ github, context }) => {
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    check_run_id: process.env.CHECK_RUN_ID,
    status: 'completed',
    conclusion: process.env.CONCLUSION
  };

  console.log('Payload', JSON.stringify(payload, null, 2));

  await github.rest.checks.update(payload);
};

module.exports = { createCheck, updateCheck };
