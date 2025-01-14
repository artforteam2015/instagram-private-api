"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("../core/repository");
const sizeOf = require("image-size");
const Bluebird = require("bluebird");
const errors_1 = require("../errors");
class PublishService extends repository_1.Repository {
    async photo(options) {
        const uploadedPhoto = await this.client.upload.photo({
            file: options.file,
        });
        const imageSize = await sizeOf(options.file);
        const configureOptions = {
            upload_id: uploadedPhoto.upload_id,
            width: imageSize.width,
            height: imageSize.height,
            caption: options.caption,
        };
        if (typeof options.usertags !== 'undefined') {
            configureOptions.usertags = options.usertags;
        }
        if (typeof options.location !== 'undefined') {
            const { lat, lng, external_id_source, external_id, name, address } = options.location;
            configureOptions.location = {
                name,
                lat,
                lng,
                address,
                external_source: external_id_source,
                external_id,
            };
            configureOptions.location[external_id_source + '_id'] = external_id;
            configureOptions.geotag_enabled = '1';
            configureOptions.media_latitude = lat.toString();
            configureOptions.media_longitude = lng.toString();
            configureOptions.posting_latitude = lat.toString();
            configureOptions.posting_longitude = lng.toString();
        }
        return await this.client.media.configure(configureOptions);
    }
    catchTranscodeError(videoInfo, transcodeDelayInMs) {
        return error => {
            if (error.response.statusCode === 202) {
                return Bluebird.delay(transcodeDelayInMs);
            }
            else {
                throw new errors_1.IgUploadVideoError(error.response, videoInfo);
            }
        };
    }
    async video(options) {
        const uploadId = Date.now().toString();
        const videoInfo = PublishService.getVideoInfo(options.video);
        await Bluebird.try(() => this.client.upload.video(Object.assign({ video: options.video, uploadId }, videoInfo))).catch(errors_1.IgResponseError, error => {
            throw new errors_1.IgUploadVideoError(error.response, videoInfo);
        });
        await this.client.upload.photo({
            file: options.coverImage,
            uploadId: uploadId.toString(),
        });
        await Bluebird.try(() => this.client.media.uploadFinish({
            upload_id: uploadId,
            source_type: '4',
            video: { length: videoInfo.duration / 1000.0 },
        })).catch(errors_1.IgResponseError, this.catchTranscodeError(videoInfo, options.transcodeDelay || 5000));
        const configureOptions = {
            upload_id: uploadId.toString(),
            caption: options.caption,
            length: videoInfo.duration / 1000.0,
            width: videoInfo.width,
            height: videoInfo.height,
            clips: [
                {
                    length: videoInfo.duration / 1000.0,
                    source_type: '4',
                },
            ],
        };
        if (typeof options.usertags !== 'undefined') {
            configureOptions.usertags = options.usertags;
        }
        if (typeof options.location !== 'undefined') {
            const { lat, lng, external_id_source, external_id, name, address } = options.location;
            configureOptions.location = {
                name,
                lat,
                lng,
                address,
                external_source: external_id_source,
                external_id,
            };
            configureOptions.location[external_id_source + '_id'] = external_id;
            configureOptions.geotag_enabled = '1';
            configureOptions.media_latitude = lat.toString();
            configureOptions.media_longitude = lng.toString();
            configureOptions.posting_latitude = lat.toString();
            configureOptions.posting_longitude = lng.toString();
        }
        return Bluebird.try(() => this.client.media.configureVideo(configureOptions)).catch(errors_1.IgResponseError, error => {
            throw new errors_1.IgConfigureVideoError(error.response, videoInfo);
        });
    }
    async album(options) {
        const isPhoto = (arg) => arg.file !== undefined;
        const isVideo = (arg) => arg.video !== undefined;
        for (const item of options.items) {
            if (isPhoto(item)) {
                const uploadedPhoto = await this.client.upload.photo({
                    file: item.file,
                    uploadId: item.uploadId,
                    isSidecar: true,
                });
                const { width, height } = await sizeOf(item.file);
                item.width = width;
                item.height = height;
                item.uploadId = uploadedPhoto.upload_id;
            }
            else if (isVideo(item)) {
                item.videoInfo = PublishService.getVideoInfo(item.video);
                item.uploadId = Date.now().toString();
                await Bluebird.try(() => this.client.upload.video(Object.assign({ video: item.video, uploadId: item.uploadId, isSidecar: true }, item.videoInfo))).catch(errors_1.IgResponseError, error => {
                    throw new errors_1.IgConfigureVideoError(error.response, item.videoInfo);
                });
                await this.client.upload.photo({
                    file: item.coverImage,
                    uploadId: item.uploadId,
                    isSidecar: true,
                });
                await Bluebird.try(() => this.client.media.uploadFinish({
                    upload_id: item.uploadId,
                    source_type: '4',
                    video: { length: item.videoInfo.duration / 1000.0 },
                })).catch(errors_1.IgResponseError, this.catchTranscodeError(item.videoInfo, item.transcodeDelay));
            }
        }
        return await this.client.media.configureSidecar({
            caption: options.caption,
            children_metadata: options.items.map(item => {
                if (isVideo(item)) {
                    return {
                        upload_id: item.uploadId,
                        width: item.videoInfo.width,
                        height: item.videoInfo.height,
                        length: item.videoInfo.duration,
                        usertags: item.usertags,
                    };
                }
                else if (isPhoto(item)) {
                    return {
                        upload_id: item.uploadId,
                        width: item.width,
                        height: item.height,
                        usertags: item.usertags,
                    };
                }
            }),
        });
    }
    async uploadAndConfigureStoryPhoto(options, configureOptions) {
        const uploadId = Date.now().toString();
        const imageSize = await sizeOf(options.file);
        await this.client.upload.photo({
            file: options.file,
            uploadId,
        });
        return await this.client.media.configureToStory(Object.assign({}, configureOptions, { upload_id: uploadId, width: imageSize.width, height: imageSize.height }));
    }
    async uploadAndConfigureStoryVideo(options, configureOptions) {
        const uploadId = Date.now().toString();
        const videoInfo = PublishService.getVideoInfo(options.video);
        await Bluebird.try(() => this.client.upload.video(Object.assign({ video: options.video, uploadId, forAlbum: true }, videoInfo))).catch(errors_1.IgResponseError, error => {
            throw new errors_1.IgConfigureVideoError(error.response, videoInfo);
        });
        await this.client.upload.photo({
            file: options.coverImage,
            uploadId,
        });
        await Bluebird.try(() => this.client.media.uploadFinish({
            upload_id: uploadId,
            source_type: '3',
            video: { length: videoInfo.duration / 1000.0 },
        })).catch(errors_1.IgResponseError, this.catchTranscodeError(videoInfo, options.transcodeDelay));
        return Bluebird.try(() => this.client.media.configureToStoryVideo(Object.assign({ upload_id: uploadId, length: videoInfo.duration / 1000.0, width: videoInfo.width, height: videoInfo.height }, configureOptions))).catch(errors_1.IgResponseError, error => {
            throw new errors_1.IgConfigureVideoError(error.response, videoInfo);
        });
    }
    async story(options) {
        const isPhoto = (arg) => arg.file !== undefined;
        const storyStickerIds = [];
        const configureOptions = {
            configure_mode: '1',
        };
        const uploadAndConfigure = () => isPhoto(options)
            ? this.uploadAndConfigureStoryPhoto(options, configureOptions)
            : this.uploadAndConfigureStoryVideo(options, configureOptions);
        const threadIds = typeof options.threadIds !== 'undefined';
        const recipients = typeof options.recipientUsers !== 'undefined';
        if (recipients || threadIds) {
            configureOptions.configure_mode = '2';
            if (recipients) {
                configureOptions.recipient_users = options.recipientUsers;
            }
            if (threadIds) {
                configureOptions.thread_ids = options.threadIds;
            }
            return await uploadAndConfigure();
        }
        if (options.toBesties) {
            configureOptions.audience = 'besties';
        }
        if (typeof options.hashtags !== 'undefined' && options.hashtags.length > 0) {
            if (typeof options.caption === 'undefined') {
                options.caption = '';
            }
            options.hashtags.forEach(hashtag => {
                if (hashtag.tag_name.includes('#')) {
                    hashtag.tag_name = hashtag.tag_name.replace('#', '');
                }
                if (!options.caption.includes(hashtag.tag_name)) {
                    options.caption = `${options.caption} ${hashtag.tag_name}`;
                }
            });
            configureOptions.story_hashtags = options.hashtags;
            configureOptions.mas_opt_in = 'NOT_PROMPTED';
        }
        if (typeof options.location !== 'undefined') {
            const { latitude, longitude } = options.location;
            configureOptions.geotag_enabled = '1';
            configureOptions.posting_latitude = latitude;
            configureOptions.posting_longitude = longitude;
            configureOptions.media_latitude = latitude;
            configureOptions.media_longitude = longitude;
            configureOptions.story_locations = [options.location.sticker];
            configureOptions.mas_opt_in = 'NOT_PROMPTED';
        }
        if (typeof options.mentions !== 'undefined' && options.mentions.length > 0) {
            if (typeof options.caption === 'undefined') {
                options.caption = '';
            }
            else {
                options.caption = options.caption.replace(' ', '+') + '+';
            }
            configureOptions.reel_mentions = options.mentions;
            configureOptions.mas_opt_in = 'NOT_PROMPTED';
        }
        if (typeof options.poll !== 'undefined') {
            configureOptions.story_polls = [options.poll];
            configureOptions.internal_features = 'polling_sticker';
            configureOptions.mas_opt_in = 'NOT_PROMPTED';
        }
        if (typeof options.slider !== 'undefined') {
            configureOptions.story_sliders = [options.slider];
            storyStickerIds.push(`emoji_slider_${options.slider.emoji}`);
        }
        if (typeof options.question !== 'undefined') {
            configureOptions.story_questions = [options.question];
            storyStickerIds.push('question_sticker_ma');
        }
        if (typeof options.countdown !== 'undefined') {
            configureOptions.story_countdowns = [options.countdown];
            storyStickerIds.push('countdown_sticker_time');
        }
        if (typeof options.media !== 'undefined') {
            configureOptions.attached_media = [options.media];
            storyStickerIds.push(`media_simple_${options.media.media_id}`);
        }
        if (typeof options.chat !== 'undefined') {
            configureOptions.story_chats = [options.chat];
            storyStickerIds.push('chat_sticker_id');
        }
        if (typeof options.link !== 'undefined' && options.link.length > 0) {
            configureOptions.story_cta = [
                {
                    links: [{ webUri: options.link }],
                },
            ];
        }
        if (storyStickerIds.length > 0) {
            configureOptions.story_sticker_ids = storyStickerIds.join(',');
        }
        return await uploadAndConfigure();
    }
    static getVideoInfo(buffer) {
        const timescale = PublishService.read32(buffer, ['moov', 'mvhd'], 12);
        const length = PublishService.read32(buffer, ['moov', 'mvhd'], 12 + 4);
        const width = PublishService.read16(buffer, ['moov', 'trak', 'stbl', 'avc1'], 24);
        const height = PublishService.read16(buffer, ['moov', 'trak', 'stbl', 'avc1'], 26);
        return {
            duration: Math.floor((length / timescale) * 1000.0),
            width,
            height,
        };
    }
    static read32(buffer, keys, offset) {
        let start = 0;
        for (const key of keys) {
            start = buffer.indexOf(Buffer.from(key), start) + key.length;
        }
        return buffer.readUInt32BE(start + offset);
    }
    static read16(buffer, keys, offset) {
        let start = 0;
        for (const key of keys) {
            start = buffer.indexOf(Buffer.from(key), start) + key.length;
        }
        return buffer.readUInt16BE(start + offset);
    }
}
exports.PublishService = PublishService;
//# sourceMappingURL=publish.service.js.map