# Cloudinary setup

This bundle replaces local image storage with Cloudinary while keeping the
BullMQ and Sharp worker flow.

## Apply the files

Extract the ZIP over the root of the same project and allow matching files to
be replaced. Then run `npm install` inside both `server` and `worker`.

## Configure credentials

Copy:

- `server/.env.example` to `server/.env`
- `worker/.env.example` to `worker/.env`

Add the same Cloudinary credentials to both files:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Get these values from Cloudinary Console > API Keys. Never commit `.env` files
or expose `CLOUDINARY_API_SECRET` in the React client.
