const commonGLPs = [
  'ozempic',
  'rybelsus',
  'wegovy',
  'trulicity',
  'victoza',
  'saxenda',
  'byetta',
  'bydureon',
  'mounjaro',
  'zepbound',
  'adlyxin',
  'tanzeum',
  'semaglutide',
  'liraglutide',
  'dulaglutide',
  'exenatide',
  'tirzepatide',
  'lixisenatide',
  'albiglutide'
];

export function isGLP(name: string) {
  const regex = new RegExp(commonGLPs.join('|'), 'i');
  return regex.test(name);
}
