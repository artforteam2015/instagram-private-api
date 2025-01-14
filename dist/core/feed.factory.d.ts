import { IgApiClient } from './client';
import { AccountFollowersFeed, AccountFollowingFeed, BlockedUsersFeed, DirectInboxFeed, DirectPendingInboxFeed, DirectThreadFeed, DiscoverFeed, PostsInsightsFeed, LocationFeed, MediaCommentsFeed, MusicGenreFeed, MusicMoodFeed, MusicSearchFeed, MusicTrendingFeed, NewsFeed, PendingFriendshipsFeed, ReelsMediaFeed, ReelsTrayFeed, SavedFeed, StoriesInsightsFeed, TagFeed, TimelineFeed, UserFeed, UsertagsFeed } from '../feeds';
import { DirectInboxFeedResponseThreadsItem } from '../responses';
import { TimelineFeedReason } from '../types/timeline-feed.types';
import { IgAppModule } from '../types/common.types';
import { PostsInsightsFeedOptions } from '../types';
export declare class FeedFactory {
    private client;
    constructor(client: IgApiClient);
    accountFollowers(id?: string | number): AccountFollowersFeed;
    accountFollowing(id?: string | number): AccountFollowingFeed;
    news(): NewsFeed;
    discover(): DiscoverFeed;
    pendingFriendships(): PendingFriendshipsFeed;
    blockedUsers(): BlockedUsersFeed;
    directInbox(): DirectInboxFeed;
    directPending(): DirectPendingInboxFeed;
    directThread(options: Pick<DirectInboxFeedResponseThreadsItem, 'thread_id' | 'oldest_cursor'>, seqId?: number): DirectThreadFeed;
    user(id: string | number): UserFeed;
    tag(tag: string): TagFeed;
    location(id: string | number, tab?: 'recent' | 'ranked'): LocationFeed;
    mediaComments(id: string): MediaCommentsFeed;
    reelsMedia(options: {
        userIds: Array<number | string>;
        source?: IgAppModule;
    }): ReelsMediaFeed;
    reelsTray(reason?: 'pull_to_refresh' | 'cold_start'): ReelsTrayFeed;
    timeline(reason?: TimelineFeedReason): TimelineFeed;
    musicTrending(product?: IgAppModule): MusicTrendingFeed;
    musicSearch(query: string, product?: IgAppModule): MusicSearchFeed;
    musicGenre(id: number | string, product?: IgAppModule): MusicGenreFeed;
    musicMood(id: number | string, product?: IgAppModule): MusicMoodFeed;
    usertags(id: number | string): UsertagsFeed;
    postsInsightsFeed(options: PostsInsightsFeedOptions): PostsInsightsFeed;
    storiesInsights(timeframe: 'ONE_DAY' | 'ONE_WEEK' | 'TWO_WEEKS'): StoriesInsightsFeed;
    saved(): SavedFeed;
}
