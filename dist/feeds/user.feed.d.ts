import { Feed } from '../core/feed';
import { UserFeedResponse, UserFeedResponseItemsItem } from '../responses';
export declare class UserFeed extends Feed<UserFeedResponse, UserFeedResponseItemsItem> {
    id: number | string;
    private nextMaxId;
    protected state: UserFeedResponse;
    request(): Promise<UserFeedResponse>;
    items(): Promise<UserFeedResponseItemsItem[]>;
    storyRequest(): Promise<UserFeedResponse>;
    storyItems(): Promise<UserFeedResponseItemsItem[]>;
}
