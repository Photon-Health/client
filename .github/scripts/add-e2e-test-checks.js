module.exports = async ({ github, context }) => {
  const payload = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    name: `e2e-tests (${process.env.APP_NAME})`,
    head_sha: process.env.SHA,
    status: 'completed',
    conclusion: process.env.CONCLUSION,
    details_url: process.env.DETAILS_URL
  };

  console.log('New check payload', JSON.stringify(payload, null, 2));

  await github.rest.checks.create(payload);
};
