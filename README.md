## strapi-provider-upload-local

### Example

`./extensions/upload/config/settings.json`

```
{
  "provider": "optimize",
  "providerOptions": {
    "sizeLimit": 2000000,
    "quality": [0.6, 0.8]
  }
}
```

The sizeLimit parameter must be a number. Be aware that the unit is in bytes, and the default is 2000000. When setting this value high, you should make sure to also configure the body parser middleware maxFileSize so the file can be sent and processed
