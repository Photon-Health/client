import { customElement } from 'solid-element';

customElement('photon-button-inner', {}, () => {
  const onClick = () => console.log('YO!!');
  return <div onClick={onClick} style={{ position: 'absolute', width: '100%', height: '100%' }} />;
});
