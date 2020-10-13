'use strict';

/**
 * Module dependencies
 * strapi-provider-upload-optimize
 * @_aungkyawkyaw
 * */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { errors } = require('strapi-plugin-upload');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

module.exports = {
    init(providerOptions) {

        const config = {
            // default file size limit
            sizeLimit: 2000000,
            // imagemin default quality
            quality: [0.6, 0.8],
            path: strapi.config.get(
                'middleware.settings.public.path',
                strapi.config.paths.static
            ),
            ...providerOptions,
        };

        const verifySize = file => {
            const sizeLimit = config.sizeLimit || 20000;
            if (file.size > sizeLimit) {
                throw errors.entityTooLarge();
            }
        }

        const uploadDir = path.resolve(strapi.dir, config.path);

        return {
            async upload(file) {
                verifySize(file);

                try {
                    const filePath = path.join(uploadDir, `/${file.hash}${file.ext}`);

                    let buffer = file.buffer;

                    const extension = file.ext.toUpperCase();

                    // Image checking                    
                    if (extension === ".JPG" || extension === ".JPEG" || extension === ".PNG") {

                        // Optimize Quality
                        buffer = await imagemin.buffer(file.buffer, {
                            plugins: [
                                imageminJpegtran(),
                                imageminPngquant({
                                    quality: config.quality
                                })
                            ]
                        });
                    }

                    const fileSize = (Buffer.byteLength(buffer) / 1000).toFixed(2);

                    file.size = fileSize;

                    await fsp.writeFile(filePath, buffer);

                    file.url = `/${file.hash}${file.ext}`;

                    return;

                } catch (e) {
                    return e;
                }
            },
            delete(file) {
                return new Promise((resolve, reject) => {
                    const filePath = path.join(uploadDir, `/${file.hash}${file.ext}`);

                    if (!fs.existsSync(filePath)) {
                        return resolve("File doesn't exist");
                    }

                    fs.unlink(filePath, err => {
                        if (err) {
                            return reject(err);
                        }

                        resolve();
                    });

                })
            },
        };
    },
};