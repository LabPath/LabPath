import fetch from 'node-fetch'
import { renameSync, writeFileSync } from 'fs'
import * as readdirp from 'readdirp'
import * as moment from 'moment'

interface Listing<T> {
    kind: string
    data: {
        modhash: string
        dist: number
        children: T[]
        after: string | null
        before: string | null
    }
} 

interface Post {
    title: string
    id: string
    permalink: string
    url: string
    created_utc: number
    created: number
    author: string
}

const root = './Maps'
const dir = readdirp(root, {
    fileFilter: '*.png',
    directoryFilter: '!.DS_Store'
});

const dateRx = /\d{4}-\d{2}-\d{2}/
const titleRx = /^(?:Lab Path|\w{3,9}) \d{1,2}(?:st|nd|rd|th)?,?(?: \w{3,9})? 20(?:19|20)?$/i

let finished = false
const posts: Post[] = []

const authors = ['Joejoe930117', 'EIykris', 'ainil'];

const populate = async (path: string, listing?: string) => {
    const { data }: Listing<Post> = await (await fetch(`${path}?after=${listing}`)).json()

    for (let i = 0; i < data.children.length; i++) {
        data.children[i] = (data.children[i] as any).data
    }

    if (!data.after) {
        finished = true
    }

    while (!finished) {
        await populate(path, data.after)
    }

    posts.push(...data.children)
};

(async () => {
    const files: string[] = []
    const failed: string[] = [Date.now().toLocaleString()]

    await populate('https://www.reddit.com/r/Lab_path.json')

    const filtered = posts.filter(({ title, author }) => title.match(titleRx) && authors.includes(author))

    const sorted = filtered.sort((a, b) => {
        return moment(a.created_utc * 1000).format('YYYYMMDD') as any -
            (moment(b.created_utc * 1000).format('YYYYMMDD') as any)
    })

    for await (const file of dir) {
        files.push(file.path)
    }

    files.sort((a, b) => {
        const first = parseInt(a.match(dateRx)[0].split('-').join(''))
        const second = parseInt(b.match(dateRx)[0].split('-').join(''))

        return first - second
    })

    for (let x = 0; x < files.length; x++) {
        const duplicate = (): Post => {
            const origin = moment(sorted[x].created_utc * 1000).date()
            const before = moment(sorted[x - 1]?.created_utc * 1000).date()
            const after = moment(sorted[x + 1].created_utc * 1000).date()

            if (origin === (before || after)) {
                return sorted[x]
            }
        }

        if (duplicate()) {
            sorted.splice(sorted.indexOf(duplicate(), 1), 1)
        }
        
        const date = moment(sorted[x].created_utc * 1000).add(1, 'd').format('YYYY-MM-DD')

        if (files[x].includes(date) && !files[x].endsWith(`${sorted[x].id}.png`)) {
            renameSync(`${root}/${files[x]}`, `${root}/${files[x].split('.png')[0]}#${sorted[x].id}.png`)
        } else {
            failed.push(files[x])
        }

        // todo: redownload april 2, april 4, july 9, july 13

        if (failed.length > 0) {
            writeFileSync(`${__dirname}/failed.txt`, failed.join('\n'))
        }

        // console.log(files[x], sorted[x].title)
    }
})()