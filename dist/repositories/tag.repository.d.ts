import { Repository } from '../core/repository';
import { TagRepositorySearchResponseRootObject } from '../responses';
export declare class TagRepository extends Repository {
    search(q: string): Promise<TagRepositorySearchResponseRootObject>;
}
