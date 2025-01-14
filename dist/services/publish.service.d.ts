/// <reference types="node" />
import { Repository } from '../core/repository';
import { PostingPhotoOptions, PostingStoryPhotoOptions, PostingVideoOptions, PostingAlbumOptions, PostingStoryVideoOptions } from '../types';
export declare class PublishService extends Repository {
    photo(options: PostingPhotoOptions): Promise<import("../responses").MediaRepositoryConfigureResponseRootObject>;
    private catchTranscodeError;
    video(options: PostingVideoOptions): Promise<import("../responses").MediaRepositoryConfigureResponseRootObject>;
    album(options: PostingAlbumOptions): Promise<any>;
    private uploadAndConfigureStoryPhoto;
    private uploadAndConfigureStoryVideo;
    story(options: PostingStoryPhotoOptions | PostingStoryVideoOptions): Promise<any>;
    static getVideoInfo(buffer: Buffer): {
        duration: number;
        width: number;
        height: number;
    };
    private static read32;
    private static read16;
}
