import { useEffect } from 'react';

const TypeformTab = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//embed.typeform.com/next/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      data-tf-widget="awCi4YTp"
      data-tf-opacity="100"
      data-tf-iframe-props="title=Photon Telehealth Provider Upload Form"
      data-tf-transitive-search-params
      data-tf-medium="snippet"
      style={{ width: '100%', height: '500px' }}
    ></div>
  );
};

export default TypeformTab;
