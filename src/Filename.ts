import { TITLE_REGEX_DISMAL } from './Constants';
import { Temporal } from 'proposal-temporal'
import { Post } from './Download'

export class Filename {
    private readonly time: Temporal.Instant

    public constructor(private readonly post: Post) {
        this.time = Temporal.Instant.fromEpochSeconds(post.created_utc)
    }

    public get name(): string {
        return `${this.mode}/${this.year}/${this.month}/${this.file}`
    }

    public get file(): string {
        return `LabPath_${this.date}#${this.post.id}`
    }

    public get mode(): string {
        if (this.post.title.match(TITLE_REGEX_DISMAL)) {
            return 'DismalMaze'
        }

        return 'ArcaneLabyrinth'
    }

    public get date(): string {
        return this.time.toString().split('T')[0]
    }

    public get month(): string {
        const long = this.time.toLocaleString('en-US', { month: 'long' })
        const digit = this.time.toLocaleString('en-US', { month: '2-digit' })

        return `${digit}_${long}`
    }

    public get year(): string {
        return this.time.toLocaleString('en-US', { year: 'numeric' })
    }
}