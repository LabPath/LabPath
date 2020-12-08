import fetch from 'node-fetch'
import { writeFile, stat } from 'fs/promises'
import { stringify } from 'querystring'
import { resolve } from 'path'
import { Filename } from './Filename'

interface ListingOptions {
    [param: string]: string | number
    before?: string
    after?: string
    limit?: number
}
interface Listing<T = Post> {
    kind: string
    data: {
        modhash: string
        dist: number
        children: T[]
        after: string | null
        before: string | null
    }
} 

export interface Post {
    title: string
    id: string
    permalink: string
    url: string
    created_utc: number
    created: number
    author: string
}

const root = resolve(`${__dirname}/../archive`)
const url = 'https://www.reddit.com/r/Lab_path.json'

export class Download {
    private readonly posts: Post[] = []

    public constructor() { this.sync() }

    /**
     * Saves an image to its respective mode, year, and month
     */
    public async sync() {
        await this.populate({ limit: 1 })

        // Reverses the post array to properly order them from oldest to newest
        this.posts.reverse()

        for (let i = 0; i < this.posts.length; i++) {
            // Constructs the path to the file
            const path = `${root}/${new Filename(this.posts[i]).name}.png`

            // Checks if file exists already
            if (await stat(path).catch(() => {})) {
                continue
            }

            // Creates a .png file
            writeFile(path, await this.buffer(this.posts[i].url))
        }
    };

    /**
     * Populates an array with posts from the subreddit
     */
    private async populate(options?: ListingOptions) {
        const { data }: Listing = await (await fetch(`${url}?${stringify(options)}`)).json()

        // Re-assigns each wrapped Post object to its own data
        // Instead of { kind: 't3_', data: <Post> }, it becomes { <Post> }
        for (let i = 0; i < data.children.length; i++) {
            data.children[i] = data.children[i]['data']
        }

        this.posts.push(...data.children)
    };

    /**
     * Turns an image link (e.g., https://i.redd.it/-------.png) into a buffer
     */
    private async buffer(image: string): Promise<Buffer> {
        return (await fetch(image)).buffer()
    };
}

new Download()

// TODO: Redownload April 2, April 4, July 9, July 13