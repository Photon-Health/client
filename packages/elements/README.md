# Photon Elements

Photon's collection of customizable and reusable components to help clients integrate seamlessly with our system. Elements can be used to add prescribing functionality into any web-based clinical tool.

## Local Development

To run at http://localhost:3000:

```shell
npx nx run elements:start
```

To modify the embedded component, edit attributes of element `photon-prescribe-workflow` inside [index.html](index.html)

To view available attributes/options, see [photon-prescribe-workflow-component.tsx](src/photon-multirx-form/photon-prescribe-workflow-component.tsx) or [official docs](https://docs.photon.health/docs/elements#prescribe-element)

### Components

After editing `packages/components`, re-run `npx nx run components:build` to see TypeScript and other changes load into `packages/elements`

## Usage

### Installation

```shell
npm i @photonhealth/elements
```

### Example

```javascript
import('@photonhealth/elements').catch((err) => {});
```

Full documentation of available elements and example configurations can be found here: [Photon Elements Documentation](https://docs.photon.health/docs/elements)
