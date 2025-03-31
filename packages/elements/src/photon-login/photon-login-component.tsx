import '../photon-auth-button';
import { customElement } from 'solid-element';
import { createEffect } from 'solid-js';
import { usePhoton } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';

const Component = (props: { redirectPath?: string }) => {
  const client = usePhoton();

  createEffect(() => {
    if (!client) {
      console.error(
        '[photon-login] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-client element'
      );
    }
  });
  return (
    <>
      <style>{tailwind}</style>
      <>
        <div class="flex flex-col w-screen max-w-sm">
          <svg
            viewBox="0 0 305 62.61"
            xmlns="http://www.w3.org/2000/svg"
            class="h-[28px] pl-[19.75px]"
          >
            <g fill="#273D52">
              <path d="M0 54.1169H6.81375V35.7722H18.0826C29.5481 35.7722 34.3963 30.3343 34.3963 18.7378V17.4275C34.3963 5.76548 29.417 0.655167 18.0826 0.655167H0V54.1169ZM6.81375 30.1377V6.28961H18.2792C24.7653 6.28961 27.386 8.9758 27.386 16.0516V20.0481C27.386 27.1895 24.7653 30.1377 18.2792 30.1377H6.81375Z" />
              <path d="M70.9593 54.1169H77.773V0.655167H70.9593V24.4378H50.8456V0.655167H44.0319V54.1169H50.8456V30.3343H70.9593V54.1169Z" />
              <path d="M107.146 54.772C119.528 54.772 125.687 46.5169 125.687 34.9205V19.7861C125.687 8.25511 119.528 0 107.146 0C94.6974 0 88.5388 8.25511 88.5388 19.7861V34.9205C88.5388 46.5169 94.6974 54.772 107.146 54.772ZM95.5491 35.9687V18.8033C95.5491 10.7448 99.4801 5.89651 107.146 5.89651C114.745 5.89651 118.677 10.7448 118.677 18.8033V35.9687C118.677 44.0928 114.745 48.8755 107.146 48.8755C99.4801 48.8755 95.5491 44.0928 95.5491 35.9687Z" />
              <path d="M144.295 54.1169H151.109V6.48616H164.54V0.655167H130.864V6.48616H144.295V54.1169Z" />
              <path d="M188.299 54.772C200.682 54.772 206.841 46.5169 206.841 34.9205V19.7861C206.841 8.25511 200.682 0 188.299 0C175.851 0 169.693 8.25511 169.693 19.7861V34.9205C169.693 46.5169 175.851 54.772 188.299 54.772ZM176.703 35.9687V18.8033C176.703 10.7448 180.634 5.89651 188.299 5.89651C195.899 5.89651 199.83 10.7448 199.83 18.8033V35.9687C199.83 44.0928 195.899 48.8755 188.299 48.8755C180.634 48.8755 176.703 44.0928 176.703 35.9687Z" />
              <path d="M217.6 54.1169H224.021V14.3482L245.576 54.1169H252.608L248.058 45.1084L245.641 40.4239L224.086 0.655167H217.6V54.1169Z" />
            </g>
            <g fill="#B35724">
              <circle cx="249.798" cy="5.202" r="5.202" />
            </g>
          </svg>
          <h1 class="font-medium text-3xl text-center font-sans mt-6 mb-3">
            Log in to your account
          </h1>
          <p class="text-gray-500 font-sans text-center mb-8">
            Don't have an account?{' '}
            <a
              href="mailto:rado@photon.health"
              class="text-teal-600 hover:underline hover:cursor-pointer font-sans font-light"
            >
              Contact Sales
            </a>
          </p>
          <photon-auth-button redirect-path={props.redirectPath} />
        </div>
      </>
    </>
  );
};

customElement(
  'photon-login',
  {
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    }
  },
  Component
);
