export function getEmbedDatadogConfig() {
  return {
    applicationId: decode('MjVhZTA2MzgtY2RmNS00M2Q1LWFkMDEtMjRjMWQ5YjQ1ZDc2Cg=='),
    clientToken: decode('cHViODIyMzYwNGY3YTQyZWM3Y2IyYjZlNTUwN2EzNjI3MmEK')
  };
}

const decode = (encoded: string) => {
  const bytes = Uint8Array.from(window.atob(encoded), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes).trim();
};
